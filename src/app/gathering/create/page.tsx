'use client';

import React from 'react';
import { useEffect, useState, useRef } from 'react';
import styles from './create.module.css';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import CategorySelectModal from '@/components/CategorySelectModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import BottomNav from '@/components/BottomNav';
import AiIntroModal from '@/components/AiIntroModal';
import GatheringFailedModal from '@/components/GatheringFailedModal';

export default function CreateGatheringPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------
  // ⭐ 로그인 관련 Hook (최상단 고정)
  // -------------------------------
  const { isLoggedIn } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoggedIn === null || isLoggedIn === undefined) return;
    setIsReady(true);
  }, [isLoggedIn]);


  // -------------------------------
  // ⭐ 모임 생성 Form State
  // -------------------------------
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [selectedCategoryList, setSelectedCategoryList] = useState<string[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [capacity, setCapacity] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [openChatUrl, setOpenChatUrl] = useState('');
  const [description, setDescription] = useState('');
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  // -------------------------------
  // ⭐ 이미지 업로드 관련 State
  // -------------------------------
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [gatheringImage, setGatheringImage] = useState<{key: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // -------------------------------
  // ⭐ 기타 상태
  // -------------------------------
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;


  // -------------------------------
  // ⭐ Presigned URL 이미지 업로드
  // -------------------------------
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setError(null);

    try {
      const presignedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/objects/presigned-url`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          "Authorization": `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const presignedData = await presignedResponse.json();

      setGatheringImage({
          key: presignedData.objectKey,  // 백엔드 필드명과 정확히 일치
      });

      const uploadURL = presignedData.uploadUrl;
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      
      if (!uploadResponse.ok) {
        throw new Error("S3 업로드 실패");
      }
      

      const url = presignedData.fileUrl;
      setImageUrl(url);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);

    } catch (err) {
      console.warn('이미지 업로드 실패:', err);
      setImagePreview('');
      setImageUrl('');
      setGatheringImage(null);
    } finally {
      setIsUploadingImage(false);
    }
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return setError('이미지 파일만 업로드 가능합니다.');
    if (file.size > 10 * 1024 * 1024) return setError('이미지 크기는 10MB 이하여야 합니다.');

    handleImageUpload(file);
  };


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



  // -------------------------------
  // ⭐ 기본 이미지 (이미지 미업로드 시)
  // -------------------------------
  const fallbackImage = {
    bucket: "gangku-default",
    key: "default/gathering-default.png",
  };


  // -------------------------------
  // ⭐ Submit Handler
  // -------------------------------
  const handleSubmit = async () => {
    const token = getAccessToken();
    if (!token) return router.push("/login");

    // ✅ 1. 프론트에서 필수 정보 먼저 검증
    if (!title.trim()) {
      setFailedMessage("모임 이름을 입력해주세요.");
      return;
    }

    if (!category) {
      setFailedMessage("카테고리를 선택해주세요.");
      return;
    }

    if (!capacity || capacity <= 0) {
      setFailedMessage("최대 인원을 1명 이상으로 입력해주세요.");
      return;
    }

    if (!date) {
      setFailedMessage("날짜와 시간을 선택해주세요.");
      return;
    }

    if (!location.trim()) {
      setFailedMessage("장소를 입력해주세요.");
      return;
    }

    // ✅ 2. 서버 요청 시작
    setIsSubmitting(true);
    setFailedMessage(null); // 모달 초기화

    const payload = {
      title,
      category,
      capacity: capacity ?? 0,
      date: new Date(date).toISOString(),
      location,
      openChatUrl,
      description,
      gatheringImageObjectKey: gatheringImage?.key ?? null,
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (res.status === 201) {
        router.push("/home?created=1");
        return;
      }

      const errorBody = await res.json().catch(() => null);

      // 🔥 서버 쪽 Validation 실패 시에도 모달로 안내
      setFailedMessage(
        errorBody?.error?.message || "모임 생성에 필요한 정보가 누락되었어요."
      );

    } catch (err: any) {
      setFailedMessage(err.message || "네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };




  // ======================================================
  // ⭐ 렌더링 (조건부 렌더링은 여기에서만 허용)
  // ======================================================
  if (!isReady) return null;

  if (isLoggedIn === false) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <LoginRequiredModal />
      </div>
    );
  }


  // ======================================================
  // ⭐ UI 렌더링
  // ======================================================
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>모임 생성</h1>

      {/* 모임 이름 */}
      <label className={styles.label}>모임 이름</label>
      <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />

      {/* 이미지 업로드 */}
      <label className={styles.label}>모임 이미지 (선택사항)</label>
      <div className={styles.imageUploadSection}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <button
          className={styles.imageUploadButton}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploadingImage ? '업로드 중...' : imagePreview ? '이미지 변경' : '이미지 업로드'}
        </button>

        {imagePreview && (
          <div className={styles.imagePreview}>
            <img src={imagePreview} alt="미리보기" />
            <button
              className={styles.removeImageButton}
              onClick={() => {
                setImagePreview('');
                setImageUrl('');
                setGatheringImage(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

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

      {/* 나머지 입력 필드 */}
      <label className={styles.label}>최대 인원</label>
      <input
        className={styles.input}
        type="number"
        value={capacity ?? ''}
        onChange={(e) => setCapacity(Number(e.target.value))}
      />

      <label className={styles.label}>날짜</label>
      <input
        className={styles.input}
        type="datetime-local"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label className={styles.label}>장소</label>
      <input
        className={styles.input}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <label className={styles.label}>오픈채팅방 링크</label>
      <input
        className={styles.input}
        value={openChatUrl}
        onChange={(e) => setOpenChatUrl(e.target.value)}
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

      <button
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? '생성 중...' : '모임 만들기'}
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

      <BottomNav active="/gathering/create" />
    </div>
  );
}