'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, Sparkles } from 'lucide-react';
import styles from './create.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import ConfirmModal from '@/components/ConfirmModal';
import AiIntroModal from '@/components/gathering/AiIntroModal';
import { useCreateGathering } from '@/hooks/gathering/useCreateGathering';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAiIntro } from '@/hooks/useAiIntro';

export default function CreateGatheringPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createGathering, isPending } = useCreateGathering();
  const { mutate: uploadImage } = useImageUpload();
  const { mutate: generateIntro, isPending: isGenerating } = useAiIntro();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageObjectKey, setImageObjectKey] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryList, setSelectedCategoryList] = useState<string[]>([]);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const [title, setTitle] = useState('');
  const [capacity, setCapacity] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [openChatUrl, setOpenChatUrl] = useState('');
  const [description, setDescription] = useState('');

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const normalizeDate = (d: string) => {
    if (d.length === 16) return `${d}:00`;  // HH:mm → HH:mm:ss
    if (d.length === 19) return d;
    return d;
  };

  const handleOpenAiModal = () => {
    if (!title.trim() || selectedCategoryList.length === 0 || !capacity || Number(capacity) < 1 || !date || !location.trim()) {
      alert('AI 설명을 생성하기 전에 모임 이름, 카테고리, 인원, 날짜, 장소를 먼저 입력해주세요.');
      return;
    }
    setShowAiModal(true);
  };

  const handleAiSubmit = (keywordsStr: string) => {
    const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);
    setShowAiModal(false);
    generateIntro(
      {
        title,
        category: selectedCategoryList[0] ?? '',
        capacity: Number(capacity),
        date: normalizeDate(date),
        location,
        keywords,
      },
      {
        onSuccess: (data) => setDescription(data.intro),
        onError: (error) => {
          console.error('AI 생성 오류:', error);
          alert('AI 모임 설명 생성 중 오류가 발생했습니다. 입력값을 확인하거나 잠시 후 다시 시도해주세요.');
        }
      }
    );
  };

  return (
    <div className={styles.container}>
      <TopNav />

      <main className={styles.main}>
        <h1 className={styles.title}>모임 생성</h1>

        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); setShowCreateConfirm(true); }}>
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

          {/* 제출 */}
          <button type="submit" className={styles.submitButton} disabled={isPending}>
            {isPending ? '생성 중...' : '모임 생성'}
          </button>
        </form>
      </main>

      <BottomNav />

      {isCategoryModalOpen && (
        <CategorySelectModal
          mode="group"
          initialSelected={selectedCategoryList}
          onConfirm={(cats) => setSelectedCategoryList(cats)}
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
        isOpen={showCreateConfirm}
        onClose={() => setShowCreateConfirm(false)}
        onConfirm={() => {
          setShowCreateConfirm(false);
          createGathering(
            {
              title,
              category: selectedCategoryList[0],
              capacity: Number(capacity),
              date: normalizeDate(date),
              location,
              openChatUrl,
              description,
              ...(imageObjectKey && { gatheringImageObjectKey: imageObjectKey }),
            },
            { onSuccess: (data) => router.push(`/gathering/${data.id}`) }
          );
        }}
        title="모임을 생성하시겠습니까?"
        confirmText="생성하기"
      />
    </div>
  );
}
