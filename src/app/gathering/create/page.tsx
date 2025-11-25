'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './create.module.css';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';
import { Home, List, Plus, Users, User } from 'lucide-react';
import Link from 'next/link';
import CategorySelectModal from '@/components/CategorySelectModal';
import LoginRequiredModal from '@/components/LoginRequiredModal';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateGatheringPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoggedIn } = useAuth();

  // ⭐ 로그인 차단 상태
  const [isReady, setIsReady] = useState(false);

 
  // ------------------------------------------------------
  // ⭐ 여기까지 왔으면 로그인 된 상태 -> 원래 페이지 렌더링
  // ------------------------------------------------------

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [category, setCategory] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryList, setSelectedCategoryList] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [openChatUrl, setOpenChatUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // 이미지 업로드 핸들러 (기존 너 코드 그대로 유지)
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setError(null);

     // ⭐ 로그인 여부 판단 후 UI 차단/허용
  useEffect(() => {
    if (isLoggedIn === null || isLoggedIn === undefined) return;
    setIsReady(true);
  }, [isLoggedIn]);

  // ⭐ 로그인 여부 확인 전 → 아무것도 보여주지 않기
  if (!isReady) return null;

  // ⭐ 로그인 안 된 상태 → 모달만 표시
  if (isLoggedIn === false) {
    return (
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <LoginRequiredModal />
      </div>
    );
  }

  
    try {
      const presignedResponse = await fetch('/api/v1/images/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const presignedData = await presignedResponse.json();
      const uploadURL = presignedData.uploadURL;

      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      let url = presignedData.url || uploadURL.split('?')[0];

      setImageUrl(url);
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);

    } catch (err) {
      console.warn('이미지 업로드 실패:', err);
      setImagePreview('');
      setImageUrl('');
      setImageFile(null);
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

  const handleAIGenerateDescription = async () => {
    if (!title || !category) {
      setError('모임 이름과 카테고리를 먼저 입력해주세요.');
      return;
    }

    setIsGeneratingDescription(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setDescription(`${title}에 참여하실 분들을 모집합니다. ${category} 관련 활동을 함께 하며 즐겁게 소통할 수 있는 모임입니다.`);
    setIsGeneratingDescription(false);
  };

  const handleSubmit = async () => {
    const token = getAccessToken();
    if (!token) return router.push('/login');

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title,
      imageUrl: imageUrl || null,
      category,
      capacity: capacity ?? 0,
      date: new Date(date).toISOString(),
      location,
      openChatUrl,
      description,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        router.push('/home?created=1');
      } else {
        const errorBody = await res.json().catch(() => null);
        setError(errorBody?.error?.message || '모임 생성 실패');
      }

    } catch (err: any) {
      setError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>모임 생성</h1>

      <label className={styles.label}>모임 이름</label>
      <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />

      <label className={styles.label}>모임 이미지 (선택사항)</label>
      <div className={styles.imageUploadSection}>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
        <button className={styles.imageUploadButton} onClick={() => fileInputRef.current?.click()}>
          {isUploadingImage ? '업로드 중...' : imagePreview ? '이미지 변경' : '이미지 업로드'}
        </button>

        {imagePreview && (
          <div className={styles.imagePreview}>
            <img src={imagePreview} alt="미리보기" />
            <button className={styles.removeImageButton} onClick={() => {
              setImagePreview('');
              setImageUrl('');
              setImageFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}>×</button>
          </div>
        )}
      </div>

      <div className={styles.categorySection}>
        <label className={styles.label}>카테고리</label>
        <button className={styles.verifyButton} onClick={() => setIsCategoryModalOpen(true)}>
          {selectedCategoryList.length > 0 ? `카테고리 선택 (${selectedCategoryList.length}/1)` : '카테고리 선택'}
        </button>

        {selectedCategoryList.length > 0 && (
          <div className={styles.selectedTags}>
            {selectedCategoryList.map((cat) => (
              <div key={cat} className={styles.tag}>
                <span>{cat}</span>
                <button className={styles.tagRemove} onClick={() => {
                  setSelectedCategoryList(prev => prev.filter(c => c !== cat));
                  setCategory('');
                }}>×</button>
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

      <label className={styles.label}>최대 인원</label>
      <input className={styles.input} type="number" value={capacity ?? ''} onChange={(e) => setCapacity(Number(e.target.value))} />

      <label className={styles.label}>날짜</label>
      <input className={styles.input} type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />

      <label className={styles.label}>장소</label>
      <input className={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} />

      <label className={styles.label}>오픈채팅방 링크</label>
      <input className={styles.input} value={openChatUrl} onChange={(e) => setOpenChatUrl(e.target.value)} />

      <div className={styles.descriptionSection}>
        <div className={styles.descriptionHeader}>
          <label className={styles.label}>모임 설명</label>
          <button className={styles.aiGenerateButton} onClick={handleAIGenerateDescription}>
            {isGeneratingDescription ? '생성 중...' : 'AI 자동생성'}
          </button>
        </div>
        <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button className={styles.submitButton} onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? '생성 중...' : '모임 만들기'}
      </button>

      <nav className={styles.bottomNav}>
        <Link href="/" className={styles.navItem}><Home size={20} /><div>홈</div></Link>
        <Link href="/category" className={styles.navItem}><List size={20} /><div>카테고리</div></Link>
        <Link href="/gathering/create" className={styles.navItem}><Plus size={20} /><div>모임 생성</div></Link>
        <Link href="/manage" className={styles.navItem}><Users size={20} /><div>모임 관리</div></Link>
        <Link href="/profile" className={styles.navItem}><User size={20} /><div>내 프로필</div></Link>
      </nav>
    </div>
  );
}