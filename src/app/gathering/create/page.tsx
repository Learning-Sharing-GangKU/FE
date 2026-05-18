'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Sparkles, AlertTriangle, Calendar } from 'lucide-react';

import styles from './create.module.css';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import CategorySelectModal from '@/components/CategorySelectModal';
import ConfirmModal from '@/components/ConfirmModal';
import AiIntroModal from '@/components/gathering/AiIntroModal';
import GatheringFailedModal from '@/components/gathering/GatheringFailedModal';

import { useCreateGathering } from '@/hooks/gathering/useCreateGathering';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useDefaultCategoryImage } from '@/hooks/useDefaultCategoryImage';
import { useAiIntro } from '@/hooks/useAiIntro';
import { useToast } from '@/hooks/useToast';
import { gatheringSchema, GatheringFormData } from '@/schemas/gatheringSchema';

export default function CreateGatheringPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: createGathering, isPending } = useCreateGathering();
  const { mutate: uploadImage } = useImageUpload();
  const { getDefaultImageObjectKey } = useDefaultCategoryImage();
  const { mutate: generateIntro, isPending: isGenerating } = useAiIntro();
  const { toast, showToast } = useToast(2000);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Ai description generator error modal
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [failedTitle, setFailedTitle] = useState<string | null>(null);
  
  // 제출 예정 폼 데이터 임시 보관
  const [pendingData, setPendingData] = useState<GatheringFormData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    control,
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
    const dateObj = new Date(d);
    if (isNaN(dateObj.getTime())) return d;
    return dateObj.toISOString().split('.')[0] + 'Z';
  };

  const onValidSubmit = (data: GatheringFormData) => {
    setPendingData(data);
    setShowCreateConfirm(true);
  };

  const handleCreateConfirm = async () => {
    if (!pendingData) return;
    setShowCreateConfirm(false);

    const apiData: any = {
      ...pendingData,
      date: normalizeDate(pendingData.date),
    };
    if (!apiData.gatheringImageObjectKey) {
      const defaultKey = await getDefaultImageObjectKey(apiData.category);
      if (defaultKey) apiData.gatheringImageObjectKey = defaultKey;
      else delete apiData.gatheringImageObjectKey;
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
        onError: (err: any) => {
          if ((err as any)?.code === 'INVALID_GATHERING_CONTENT') {
            setFailedTitle('AI 모임 소개 자동 생성 실패');
            setFailedMessage('모임 정보 내용에 금칙어가 포함되어 있습니다.');
          } else {
            showToast('AI 모임 설명 생성 중 오류가 발생했습니다.');
          }
        }
      }
    );
  };

  return (
    <div className={styles.container}>
      <TopNav />
      {toast && <div className={styles.toastMessage}>{toast}</div>}

      <main className={styles.main}>
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
            <label className={styles.label}>모임 날짜 및 시간</label>
            <Controller
              control={control}
              name="date"
              render={({ field }) => {
                const val = field.value ? new Date(field.value) : null;
                
                const currentH = val ? val.getHours() : 12;
                const currentM = val ? val.getMinutes() : 0;
                const amPm = currentH >= 12 ? 'PM' : 'AM';
                const displayH = currentH % 12 === 0 ? 12 : currentH % 12;

                const updateDate = (newDate: Date | null, newAmPm: 'AM' | 'PM', newH: number, newM: number) => {
                  if (!newDate) {
                    field.onChange('');
                    return;
                  }
                  let h = newH;
                  if (newAmPm === 'PM' && h < 12) h += 12;
                  if (newAmPm === 'AM' && h === 12) h = 0;

                  const updated = new Date(newDate);
                  updated.setHours(h, newM, 0, 0);
                  const offset = updated.getTimezoneOffset() * 60000;
                  const localISOTime = new Date(updated.getTime() - offset).toISOString().slice(0, 16);
                  field.onChange(localISOTime);
                };

                return (
                  <div className={styles.dateTimeContainer}>
                    <div className={styles.dateRow}>
                      <DatePicker
                        selected={val}
                        onChange={(date) => updateDate(date, amPm, displayH, currentM)}
                        dateFormat="yyyy.MM.dd"
                        placeholderText="YYYY.MM.DD"
                        className={`${styles.input} ${styles.dateInput} ${errors.date ? styles.inputError : ''} ${styles.customDatepicker}`}
                      />
                      <Calendar className={styles.calendarIcon} />
                    </div>
                    <div className={styles.timeSelects}>
                      <select
                        value={amPm}
                        onChange={(e) => updateDate(val || new Date(), e.target.value as 'AM' | 'PM', displayH, currentM)}
                        className={styles.timeSelect}
                      >
                        <option value="AM">오전</option>
                        <option value="PM">오후</option>
                      </select>
                      <select
                        value={displayH}
                        onChange={(e) => updateDate(val || new Date(), amPm, parseInt(e.target.value), currentM)}
                        className={styles.timeSelect}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={h}>{h}시</option>
                        ))}
                      </select>
                      <select
                        value={currentM}
                        onChange={(e) => updateDate(val || new Date(), amPm, displayH, parseInt(e.target.value))}
                        className={styles.timeSelect}
                      >
                        {Array.from({ length: 6 }, (_, i) => i * 10).map((m) => (
                          <option key={m} value={m}>{m.toString().padStart(2, '0')}분</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              }}
            />
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
            {failedMessage && (
        <GatheringFailedModal
          title={failedTitle ?? ''}
          message={failedMessage ?? ''}
          onClose={() => {
            setFailedTitle(null);
            setFailedMessage(null);
          }}
          />
      )}
    </div>
  );
}
