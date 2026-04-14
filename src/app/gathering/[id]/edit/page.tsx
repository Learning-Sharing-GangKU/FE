"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from "next/navigation";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, Sparkles, AlertTriangle } from 'lucide-react';

import styles from "../../create/create.module.css";
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { getAccessToken } from "@/lib/auth";
import CategorySelectModal from "@/components/CategorySelectModal";
import AiIntroModal from '@/components/gathering/AiIntroModal';
import ConfirmModal from '@/components/ConfirmModal';
import GatheringFailedModal from '@/components/gathering/GatheringFailedModal';
import { useUpdateGathering } from '@/hooks/gathering/useUpdateGathering';
import { useAiIntro } from '@/hooks/useAiIntro';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/useToast';
import { gatheringSchema, GatheringFormData } from '@/schemas/gatheringSchema';

export default function GatheringEditPage() {
    const params = useParams();
    const router = useRouter();
    const gatheringId = params.id as string;
    const token = getAccessToken();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: updateGathering, isPending: isUpdating } = useUpdateGathering();
    const { mutate: generateIntro, isPending: isGenerating } = useAiIntro();
    const { mutate: uploadImage } = useImageUpload();
    const { toast, showToast } = useToast(3000);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [showEditConfirm, setShowEditConfirm] = useState(false);

    // UI Preview
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Fallback error modal
    const [failedMessage, setFailedMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        reset,
        formState: { errors, dirtyFields },
    } = useForm<GatheringFormData>({
        resolver: zodResolver(gatheringSchema),
    });

    const selectedCategory = watch('category');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings/${gatheringId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const json = await res.json();
                if (!res.ok) {
                    showToast("모임 정보를 불러오지 못했습니다.");
                    return;
                }

                let localDateStr = "";
                if (json.date) {
                    const local = new Date(json.date);
                    localDateStr = local.toISOString().slice(0, 16);
                }

                reset({
                    title: json.title,
                    description: json.description,
                    capacity: json.capacity,
                    date: localDateStr,
                    location: json.location,
                    openChatUrl: json.openChatUrl,
                    category: json.category,
                    gatheringImageObjectKey: json.gatheringImageObjectKey,
                });

                setImagePreview(json.gatheringImageUrl);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [gatheringId, token, reset, showToast]);

    const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);

        uploadImage(file, {
            onSuccess: ({ objectKey }) => {
                setValue('gatheringImageObjectKey', objectKey, { shouldDirty: true, shouldValidate: true });
            },
            onError: () => showToast("이미지 업로드에 실패했습니다."),
        });
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setValue('gatheringImageObjectKey', null, { shouldDirty: true, shouldValidate: true });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const normalizeDate = (d: string) => {
        if (!d) return '';
        if (d.length === 16) return `${d}:00`;
        if (d.length === 19) return d;
        return d;
    };

    const handleSave = () => {
        setShowEditConfirm(false);
        const submitData = getValues();
        const updated: any = {};

        for (const key in dirtyFields) {
            const fieldKey = key as keyof GatheringFormData;
            updated[fieldKey] = submitData[fieldKey];
        }

        if (updated.date) {
            updated.date = normalizeDate(updated.date);
        }

        if (Object.keys(updated).length === 0) {
            showToast("변경된 내용이 없습니다.");
            return;
        }

        updateGathering(
            { gatheringId, data: updated },
            {
                onSuccess: () => {
                    router.push(`/gathering/${gatheringId}`);
                },
                onError: (err: any) => {
                    const message = err.message || "수정에 실패했습니다.";
                    setFailedMessage(`수정 실패: ${message}`);
                },
            }
        );
    };

    const onValidSubmit = () => {
        setShowEditConfirm(true);
    };

    const handleOpenAiModal = () => {
        const { title, date, location, capacity } = getValues();
        if (!title?.trim() || !selectedCategory || !capacity || capacity < 1 || !date || !location?.trim()) {
            showToast('AI 설명을 생성하기 전에 메인 정보를 모두 입력해주세요.');
            return;
        }
        setShowAiModal(true);
    };

    const handleAiSubmit = (keywordsStr: string) => {
        const keywords = keywordsStr.split(',').map(k => k.trim()).filter(Boolean);
        setShowAiModal(false);

        const { title, date, location, capacity } = getValues();

        generateIntro(
            {
                title,
                category: selectedCategory,
                capacity: Number(capacity),
                date: normalizeDate(date),
                location,
                keywords,
            },
            {
                onSuccess: (data) => {
                    setValue('description', data.intro, { shouldDirty: true, shouldValidate: true });
                },
                onError: () => showToast("AI 요청 중 오류가 발생했습니다."),
            }
        );
    };

    if (loading) return <div className={styles.container} style={{ padding: "100px", textAlign: "center" }}>로딩중...</div>;

    return (
        <div className={styles.container}>
            <TopNav />

            <main className={styles.main}>
                <h1 className={styles.title}>모임 수정</h1>

                <form className={styles.form} onSubmit={handleSubmit(onValidSubmit)} noValidate>
                    {/* 모임 이름 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 이름</label>
                        <input
                            type="text"
                            placeholder="모임 이름을 입력하세요"
                            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                            {...register('title')}
                        />
                        {errors.title && (
                            <div className={styles.errorWrapper}>
                                <AlertTriangle className={styles.errorIcon} />
                                <span className={styles.errorText}>{errors.title.message}</span>
                            </div>
                        )}
                    </div>

                    {/* 모임 이미지 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 이미지 (선택사항)</label>
                        <div className={styles.imageSection}>
                            {imagePreview && (
                                <div className={styles.imagePreview}>
                                    <img src={imagePreview} alt="모임 미리보기" className={styles.previewImg} />
                                    <button
                                        type="button"
                                        className={styles.removeImageButton}
                                        onClick={handleRemoveImage}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                id="meeting-image"
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImagePreview}
                            />
                            <button
                                type="button"
                                className={styles.uploadButton}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? '이미지 변경' : '이미지 업로드'}
                            </button>
                        </div>
                        <input type="hidden" {...register('gatheringImageObjectKey')} />
                    </div>

                    {/* 카테고리 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 카테고리</label>
                        <button
                            type="button"
                            className={`${styles.categoryButton} ${errors.category ? styles.inputError : ''}`}
                            onClick={() => setIsCategoryModalOpen(true)}
                        >
                            {selectedCategory
                                ? `카테고리 선택 (1/1)`
                                : '모임 카테고리 선택'}
                        </button>
                        {selectedCategory && (
                            <div className={styles.selectedTags}>
                                <div className={styles.tag}>
                                    <span>{selectedCategory}</span>
                                    <button
                                        type="button"
                                        className={styles.tagRemove}
                                        onClick={() => setValue('category', '', { shouldDirty: true, shouldValidate: true })}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                        {errors.category && (
                            <div className={styles.errorWrapper}>
                                <AlertTriangle className={styles.errorIcon} />
                                <span className={styles.errorText}>{errors.category.message}</span>
                            </div>
                        )}
                    </div>

                    {/* 최대 인원 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 최대인원</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="최대 인원을 입력하세요"
                            className={`${styles.input} ${errors.capacity ? styles.inputError : ''}`}
                            {...register('capacity', { valueAsNumber: true })}
                        />
                        {errors.capacity && (
                            <div className={styles.errorWrapper}>
                                <AlertTriangle className={styles.errorIcon} />
                                <span className={styles.errorText}>{errors.capacity.message}</span>
                            </div>
                        )}
                    </div>

                    {/* 날짜 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 날짜</label>
                        <div className={styles.dateRow}>
                            <input
                                type="datetime-local"
                                className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                                {...register('date')}
                            />
                            <Calendar size={20} className={styles.calendarIcon} />
                        </div>
                        {errors.date && (
                            <div className={styles.errorWrapper}>
                                <AlertTriangle className={styles.errorIcon} />
                                <span className={styles.errorText}>{errors.date.message}</span>
                            </div>
                        )}
                    </div>

                    {/* 장소 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 장소</label>
                        <input
                            type="text"
                            placeholder="장소를 입력하세요"
                            className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                            {...register('location')}
                        />
                        {errors.location && (
                            <div className={styles.errorWrapper}>
                                <AlertTriangle className={styles.errorIcon} />
                                <span className={styles.errorText}>{errors.location.message}</span>
                            </div>
                        )}
                    </div>

                    {/* 오픈채팅방 링크 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 오픈채팅방 링크</label>
                        <input
                            type="url"
                            placeholder="https://open.kakao.com/..."
                            className={`${styles.input} ${errors.openChatUrl ? styles.inputError : ''}`}
                            {...register('openChatUrl')}
                        />
                        {errors.openChatUrl ? (
                            <div className={styles.errorWrapper}>
                                <AlertTriangle className={styles.errorIcon} />
                                <span className={styles.errorText}>{errors.openChatUrl.message}</span>
                            </div>
                        ) : (
                            <p className={styles.hint}>https://를 포함한 전체 링크를 적어주세요</p>
                        )}
                    </div>

                    {/* 모임 설명 */}
                    <div className={styles.fieldGroup}>
                        <div className={styles.descriptionHeader}>
                            <label className={styles.label}>모임 설명</label>
                            <div className={styles.aiRow}>
                                <span className={styles.aiHint}>모임 설명을 자동으로 적어드릴까요?</span>
                                <button
                                    type="button"
                                    className={styles.aiButton}
                                    onClick={handleOpenAiModal}
                                    disabled={isGenerating}
                                >
                                    <Sparkles size={14} />
                                    {isGenerating ? '생성 중...' : 'AI 자동생성'}
                                </button>
                            </div>
                        </div>
                        <textarea
                            placeholder="모임에 대한 설명을 입력하세요"
                            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                            {...register('description')}
                        />
                        {errors.description && (
                            <div className={styles.errorWrapper}>
                                <AlertTriangle className={styles.errorIcon} />
                                <span className={styles.errorText}>{errors.description.message}</span>
                            </div>
                        )}
                    </div>

                    {/* 제출 */}
                    <button type="submit" className={styles.submitButton} disabled={isUpdating}>
                        {isUpdating ? '수정 중...' : '수정 완료'}
                    </button>
                </form>
            </main>

            <BottomNav />

            {isCategoryModalOpen && (
                <CategorySelectModal
                    mode="group"
                    initialSelected={selectedCategory ? [selectedCategory] : []}
                    onConfirm={(cats) => {
                        setValue('category', cats[0] || '', { shouldDirty: true, shouldValidate: true });
                        setIsCategoryModalOpen(false);
                    }}
                    onClose={() => setIsCategoryModalOpen(false)}
                />
            )}

            {showAiModal && (
                <AiIntroModal
                    onClose={() => setShowAiModal(false)}
                    onSubmit={handleAiSubmit}
                />
            )}

            <ConfirmModal
                isOpen={showEditConfirm}
                onClose={() => setShowEditConfirm(false)}
                onConfirm={handleSave}
                title="모임을 수정하시겠습니까?"
                confirmText="수정하기"
            />

            {failedMessage && (
                <GatheringFailedModal
                    onClose={() => setFailedMessage(null)}
                    message={failedMessage}
                />
            )}
        </div>
    );
}

