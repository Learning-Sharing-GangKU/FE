"use client";

import React from 'react';
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./edit.module.css";
import { getAccessToken } from "@/lib/auth";
import CategorySelectModal from "@/components/CategorySelectModal";
import AiIntroModal from '@/components/AiIntroModal';
import GatheringFailedModal from '@/components/GatheringFailedModal';


export default function GatheringEditPage() {
    const [selectedCategoryList, setSelectedCategoryList] = useState<string[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [toast, setToast] = React.useState<string | null>(null);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const params = useParams();
    const router = useRouter();
    const gatheringId = params.id as string;

    const token = getAccessToken();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [original, setOriginal] = useState<any>(null); // 🔥 원본 데이터 저장
    const [loading, setLoading] = useState(true);

    // 입력값 상태
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [capacity, setCapacity] = useState(1);
    const [date, setDate] = useState("");
    const [openChatUrl, setOpenChatUrl] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageObjectKey, setImageObjectKey] = useState<string | null>(null);

    const [failedMessage, setFailedMessage] = useState<string | null>(null);
    // ==================================================
    // 1) GET — 기존 정보 불러오기
    // ==================================================
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings/${gatheringId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                const json = await res.json();
                if (!res.ok) {
                    setToast("모임 정보를 불러오지 못했습니다.");
                    return;
                }

                setOriginal(json); // 🔥 원본 저장

                // 입력값에 반영
                setTitle(json.title);
                setDescription(json.description);
                setCategory(json.category);
                setLocation(json.location);
                setCapacity(json.capacity);
                setOpenChatUrl(json.openChatUrl);
                setImageUrl(json.gatheringImageUrl);
                setImageObjectKey(json.gatheringImageObjectKey);

                if (json.category) {
                    setSelectedCategoryList([json.category]);
                }
                // date → datetime-local 포맷으로 변환
                const local = new Date(json.date);
                setDate(local.toISOString().slice(0, 16));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gatheringId]);

    // ==================================================
    // 2) 이미지 업로드 (현재는 preview용)
    // ==================================================
    const onChangeImage = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageUrl(URL.createObjectURL(file));
        setImageObjectKey("temp/local-preview"); // presigned 붙이면 수정됨
    };

    // ==================================================
    // 3) PATCH — 변경된 내용만 보내기
    // ==================================================
    const handleSave = async () => {
        if (!original) return;

        // 🔥 프론트단 필수값 검사
        if (!title.trim()) {
            setFailedMessage("모임 이름을 입력해주세요.");
            return;
        }
        if (!category) {
            setFailedMessage("카테고리를 선택해주세요.");
            return;
        }
        if (!location.trim()) {
            setFailedMessage("장소를 입력해주세요.");
            return;
        }
        if (!date) {
            setFailedMessage("날짜를 선택해주세요.");
            return;
        }
        if (!capacity || capacity < 1) {
            setFailedMessage("최대 인원은 1명 이상이어야 합니다.");
            return;
        }
        if (!original) return;

        const updated: any = {}; // 🔥 바뀐 항목만 담는 객체

        // 변경 감지(diff)
        if (original.title !== title) updated.title = title;
        if (original.description !== description) updated.description = description;
        if (original.category !== category) updated.category = category;
        if (original.location !== location) updated.location = location;
        if (original.capacity !== capacity) updated.capacity = capacity;

        const utcDate = new Date(date).toISOString();
        if (original.date !== utcDate) updated.date = utcDate;

        if (original.openChatUrl !== openChatUrl) updated.openChatUrl = openChatUrl;

        if (imageObjectKey && original.gatheringImageObjectKey !== imageObjectKey) {
            updated.gatheringImageObjectKey = imageObjectKey;
        }

        // 변경된 게 없으면 PATCH 안 보냄
        if (Object.keys(updated).length === 0) {
            setToast("변경된 내용이 없습니다.");
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings/${gatheringId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updated),
                }
            );

            const json = await res.json();

            if (!res.ok) {
                setToast(json.error?.message || "수정에 실패했습니다.");
                return;
            }

            setToast("수정 완료!");
            setTimeout(() => {
                router.push(`/gathering/${gatheringId}`);
            }, 500);
        } catch (err) {
            setToast("서버 오류가 발생했습니다.");
        }
    };

    if (loading) return <div>로딩중...</div>;

    // -------------------------------
    // ⭐ AI 모임 설명 자동 생성
    // -------------------------------

    const handleAIGenerateDescription = () => {
        if (!title || !category || !capacity || !date || !location) {
            setError("모든 기본 정보를 먼저 입력해주세요.");
            return;
        }
        setShowAiModal(true); // 🔥 모달 열기
    };

    const handleSubmitAiIntro = async (keywords: string) => {
        setShowAiModal(false);

        try {
            const token = getAccessToken();

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings/intro`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title,
                        category,
                        capacity,
                        date: new Date(date).toISOString(),
                        location,
                        keywords: keywords.split(",").map(k => k.trim()),
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) {
                setError(data.error?.message || "AI 생성 실패");
                return;
            }

            // 🔥 설명 자동 생성 적용
            setDescription(data.intro);

        } catch (e) {
            setError("AI 요청 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className={styles.container}>
            {toast && <div className={styles.toast}>{toast}</div>}

            {/* 제목 */}
            <h1 className={styles.title}>모임 수정</h1>

            {/* ===========================
          이미지 업로드
      ============================ */}
            <div className={styles.label}>모임 이미지 (선택사항)</div>
            <div className={styles.imageUploadSection}>
                <button
                    className={styles.imageUploadButton}
                    onClick={() => fileInputRef.current?.click()}
                >
                    이미지 업로드
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={onChangeImage}
                />

                {imageUrl && (
                    <div className={styles.imagePreview}>
                        <img src={imageUrl} alt="미리보기" />
                    </div>
                )}
            </div>

            {/* ===========================
          모임 이름
      ============================ */}
            <div className={styles.label}>모임 이름</div>
            <input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="모임 이름을 입력하세요"
            />

            {/* 카테고리 선택 */}
            <div className={styles.categorySection}>
                <label className={styles.label}>카테고리</label>
                <button className={styles.verifyButton} onClick={() => setIsCategoryModalOpen(true)}>
                    {selectedCategoryList.length > 0
                        ? `카테고리 선택 (${selectedCategoryList.length}/1)`
                        : '카테고리 선택'}
                </button>

                {selectedCategoryList.length > 0 && (
                    <div className={styles.selectedTags}>
                        {selectedCategoryList.map((cat) => (
                            <div key={cat} className={styles.tag}>
                                <span>{cat}</span>
                                <button
                                    className={styles.tagRemove}
                                    onClick={() => {
                                        setSelectedCategoryList(prev => prev.filter(c => c !== cat));
                                        setCategory('');
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {isCategoryModalOpen && (
                    <CategorySelectModal
                        selected={selectedCategoryList}
                        setSelected={setSelectedCategoryList}
                        max={1}
                        onClose={() => {
                            setCategory(selectedCategoryList[0] || '');
                            setIsCategoryModalOpen(false);
                        }}
                    />
                )}
            </div>

            <div className={styles.label}>최대 인원</div>
            <input
                className={styles.input}
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
            />

            {/* ===========================
                        날짜
            ============================ */}
            <div className={styles.label}>날짜</div>
            <input
                className={styles.input}
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            {/* ===========================
                        장소
            ============================ */}
            <div className={styles.label}>장소</div>
            <input
                className={styles.input}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="장소를 입력하세요"
            />

            {/* ===========================
                    오픈채팅 링크
            ============================ */}
            <div className={styles.label}>오픈채팅 링크</div>
            <input
                className={styles.input}
                value={openChatUrl}
                onChange={(e) => setOpenChatUrl(e.target.value)}
                placeholder="https:// 로 시작하는 링크"
            />

            {/* 모임 설명 */}
            <div className={styles.descriptionSection}>
                <div className={styles.descriptionHeader}>
                    <label className={styles.label}>모임 설명</label>

                    <button
                        className={styles.aiGenerateButton}
                        onClick={handleAIGenerateDescription}
                    >
                        AI 자동생성
                    </button>
                </div>

                <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {error && <div className={styles.error}>{error}</div>}


            {/* ===========================
                    저장 버튼
            ============================ */}
            <button className={styles.submitButton} onClick={handleSave}>
                수정 완료
            </button>
            {showAiModal && (
                <AiIntroModal
                    onClose={() => setShowAiModal(false)}
                    onSubmit={handleSubmitAiIntro}
                />
            )}
            {failedMessage && (
                <GatheringFailedModal
                    message={failedMessage}
                    onClose={() => setFailedMessage(null)}
                />
            )}

        </div>
    );


}
