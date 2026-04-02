"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from "next/navigation";
import { X, Calendar, Sparkles } from 'lucide-react';
import styles from "../../create/create.module.css"; // 🔥 생성 페이지 CSS 재사용
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

export default function GatheringEditPage() {
    const [selectedCategoryList, setSelectedCategoryList] = useState<string[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [showAiModal, setShowAiModal] = useState(false);
    const [showEditConfirm, setShowEditConfirm] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const { mutate: updateGathering, isPending: isUpdating } = useUpdateGathering();
    const { mutate: generateIntro, isPending: isGenerating } = useAiIntro();
    const { mutate: uploadImage } = useImageUpload();
    const params = useParams();
    const router = useRouter();
    const gatheringId = params.id as string;

    const token = getAccessToken();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [original, setOriginal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [capacity, setCapacity] = useState("");
    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [openChatUrl, setOpenChatUrl] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageObjectKey, setImageObjectKey] = useState<string | null>(null);

    const [failedMessage, setFailedMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings/${gatheringId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const json = await res.json();
                if (!res.ok) {
                    setToast("모임 정보를 불러오지 못했습니다.");
                    return;
                }

                setOriginal(json);
                setTitle(json.title);
                setDescription(json.description);
                setLocation(json.location);
                setCapacity(String(json.capacity));
                setOpenChatUrl(json.openChatUrl);
                setImagePreview(json.gatheringImageUrl);
                setImageObjectKey(json.gatheringImageObjectKey);

                if (json.category) {
                    setSelectedCategoryList([json.category]);
                }
                const local = new Date(json.date);
                setDate(local.toISOString().slice(0, 16));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [gatheringId, token]);

    const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        uploadImage(file, {
            onSuccess: ({ objectKey }) => setImageObjectKey(objectKey),
        });
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageObjectKey(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = async () => {
        setShowEditConfirm(false);
        if (!original) return;

        if (!title.trim()) return setFailedMessage("모임 이름을 입력해주세요.");
        if (selectedCategoryList.length === 0) return setFailedMessage("카테고리를 선택해주세요.");
        if (!location.trim()) return setFailedMessage("장소를 입력해주세요.");
        if (!date) return setFailedMessage("날짜를 선택해주세요.");
        if (!capacity || Number(capacity) < 1) return setFailedMessage("최대 인원은 1명 이상이어야 합니다.");

        const updated: any = {};
        if (original.title !== title) updated.title = title;
        if (original.description !== description) updated.description = description;
        if (original.category !== selectedCategoryList[0]) updated.category = selectedCategoryList[0];
        if (original.location !== location) updated.location = location;
        if (original.capacity !== Number(capacity)) updated.capacity = Number(capacity);

        let formattedDate = date;
        if (formattedDate.length === 16) formattedDate = `${formattedDate}:00`;
        if (original.date !== formattedDate) updated.date = formattedDate;

        if (original.openChatUrl !== openChatUrl) updated.openChatUrl = openChatUrl;

        // 이미지 처리 로직
        if (imageObjectKey && original.gatheringImageObjectKey !== imageObjectKey) {
            updated.gatheringImageObjectKey = imageObjectKey;
        }

        if (Object.keys(updated).length === 0) {
            setToast("변경된 내용이 없습니다.");
            return;
        }

        updateGathering(
            { gatheringId, data: updated },
            {
                onSuccess: () => {
                    setToast("수정 완료!");
                    router.push(`/gathering/${gatheringId}`);
                },
                onError: () => setToast("수정에 실패했습니다."),
            }
        );
    };

    const handleOpenAiModal = () => {
        if (!title.trim() || selectedCategoryList.length === 0 || !capacity || Number(capacity) < 1 || !date || !location.trim()) {
            setFailedMessage('AI 설명을 생성하기 전에 메인 정보를 모두 입력해주세요.');
            return;
        }
        setShowAiModal(true);
    };

    const handleAiSubmit = (keywordsStr: string) => {
        const keywords = keywordsStr.split(',').map(k => k.trim()).filter(Boolean);
        setShowAiModal(false);
        
        let formattedDate = date;
        if (formattedDate.length === 16) formattedDate = `${formattedDate}:00`;

        generateIntro(
            {
                title,
                category: selectedCategoryList[0],
                capacity: Number(capacity),
                date: formattedDate,
                location,
                keywords,
            },
            {
                onSuccess: (data) => setDescription(data.intro),
                onError: () => setFailedMessage("AI 요청 중 오류가 발생했습니다."),
            }
        );
    };

    if (loading) return <div className={styles.container} style={{ padding: "100px", textAlign: "center" }}>로딩중...</div>;

    return (
        <div className={styles.container}>
            <TopNav />

            {toast && <div style={{position: 'fixed', top: 60, left: 0, width: '100%', textAlign: 'center', background: '#4CAF50', color: '#fff', padding: '10px', zIndex: 1000}}>{toast}</div>}

            <main className={styles.main}>
                <h1 className={styles.title}>모임 수정</h1>

                <form className={styles.form} onSubmit={(e) => { e.preventDefault(); setShowEditConfirm(true); }}>
                    {/* 모임 이름 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 이름</label>
                        <input
                            type="text"
                            placeholder="모임 이름을 입력하세요"
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
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
                    </div>

                    {/* 카테고리 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 카테고리</label>
                        <button
                            type="button"
                            className={styles.categoryButton}
                            onClick={() => setIsCategoryModalOpen(true)}
                        >
                            {selectedCategoryList.length > 0
                                ? `카테고리 선택 (${selectedCategoryList.length}/1)`
                                : '모임 카테고리 선택'}
                        </button>
                        {selectedCategoryList.length > 0 && (
                            <div className={styles.selectedTags}>
                                {selectedCategoryList.map((cat) => (
                                    <div key={cat} className={styles.tag}>
                                        <span>{cat}</span>
                                        <button
                                            type="button"
                                            className={styles.tagRemove}
                                            onClick={() => setSelectedCategoryList([])}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
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
                            className={styles.input}
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                        />
                    </div>

                    {/* 날짜 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 날짜</label>
                        <div className={styles.dateRow}>
                            <input
                                type="datetime-local"
                                className={styles.input}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <Calendar size={20} className={styles.calendarIcon} />
                        </div>
                    </div>

                    {/* 장소 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 장소</label>
                        <input
                            type="text"
                            placeholder="장소를 입력하세요"
                            className={styles.input}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    {/* 오픈채팅방 링크 */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>모임 오픈채팅방 링크</label>
                        <input
                            type="url"
                            placeholder="https://open.kakao.com/..."
                            className={styles.input}
                            value={openChatUrl}
                            onChange={(e) => setOpenChatUrl(e.target.value)}
                        />
                        <p className={styles.hint}>https://를 포함한 전체 링크를 적어주세요</p>
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
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

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
                    initialSelected={selectedCategoryList}
                    onConfirm={(cats) => { setSelectedCategoryList(cats); setIsCategoryModalOpen(false); }}
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
                    message={failedMessage}
                    onClose={() => setFailedMessage(null)}
                />
            )}
        </div>
    );
}
