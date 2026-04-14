'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Calendar, Sparkles, AlertTriangle } from 'lucide-react';

import styles from './create.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import ConfirmModal from '@/components/ConfirmModal';
import AiIntroModal from '@/components/gathering/AiIntroModal';
import { useCreateGathering } from '@/hooks/gathering/useCreateGathering';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAiIntro } from '@/hooks/useAiIntro';
import { useToast } from '@/hooks/useToast';
import { gatheringSchema, GatheringFormData } from '@/schemas/gatheringSchema';

export default function CreateGatheringPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: createGathering, isPending } = useCreateGathering();
  const { mutate: uploadImage } = useImageUpload();
  const { mutate: generateIntro, isPending: isGenerating } = useAiIntro();
  const { toast, showToast } = useToast(3000);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  
  // 제출 예정 폼 데이터 임시 보관
  const [pendingData, setPendingData] = useState<GatheringFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<GatheringFormData>({
    resolver: zodResolver(gatheringSchema),
    defaultValues: {
      category: '',
      gatheringImageObjectKey: null,
    },
  });

  const selectedCategory = watch('category');

  const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    uploadImage(file, {
      onSuccess: ({ objectKey }) => setValue('gatheringImageObjectKey', objectKey),
      onError: () => showToast('이미지 업로드에 실패했습니다.'),
    });
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('gatheringImageObjectKey', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const normalizeDate = (d: string) => {
    if (!d) return '';
    if (d.length === 16) return `${d}:00`;  // HH:mm → HH:mm:ss
    if (d.length === 19) return d;
    return d;
  };

  const onValidSubmit = (data: GatheringFormData) => {
    setPendingData(data);
    setShowCreateConfirm(true);
  };

  const handleCreateConfirm = () => {
    if (!pendingData) return;
    setShowCreateConfirm(false);
    
    const apiData: any = {
      ...pendingData,
      date: normalizeDate(pendingData.date),
    };
    if (!apiData.gatheringImageObjectKey) {
      delete apiData.gatheringImageObjectKey;
    }

    createGathering(apiData, {
      onSuccess: (resData) => {
        router.push(`/gathering/${resData.id}`);
      },
      onError: (err: any) => {
        const errorMsg = err.message || '알 수 없는 오류가 발생했습니다.';
        showToast(`모임 생성 실패: ${errorMsg}`);
      },
    });
  };

  const handleOpenAiModal = () => {
    const { title, date, location, capacity } = getValues();
    if (!title?.trim() || !selectedCategory || !capacity || capacity < 1 || !date || !location?.trim()) {
      showToast('AI 설명을 생성하기 전에 모임 이름, 카테고리, 인원, 날짜, 장소를 먼저 입력해주세요.');
      return;
    }
    setShowAiModal(true);
  };

  const handleAiSubmit = (keywordsStr: string) => {
    const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);
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
        onError: (error) => {
          console.error('AI 생성 오류:', error);
          showToast('AI 모임 설명 생성 중 오류가 발생했습니다.');
        }
      }
    );
  };

  return (
    <div className={styles.container}>
      <TopNav />
      {toast && <div className={styles.toastMessage}>{toast}</div>}

      <main className={styles.main}>
        <h1 className={styles.title}>모임 생성</h1>

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
                    onClick={() => setValue('category', '', { shouldValidate: true })}
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
          <button type="submit" className={styles.submitButton} disabled={isPending}>
            {isPending ? '생성 중...' : '모임 생성'}
          </button>
        </form>
      </main>

      <BottomNav />

      {isCategoryModalOpen && (
        <CategorySelectModal
          mode="group"
          initialSelected={selectedCategory ? [selectedCategory] : []}
          onConfirm={(cats) => {
            setValue('category', cats[0] || '', { shouldValidate: true });
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
        isOpen={showCreateConfirm}
        onClose={() => setShowCreateConfirm(false)}
        onConfirm={handleCreateConfirm}
        title="모임을 생성하시겠습니까?"
        confirmText="생성하기"
      />
    </div>
  );
}
