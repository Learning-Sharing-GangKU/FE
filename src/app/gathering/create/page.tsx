'use client';

import { useState, useRef } from 'react';
import styles from './create.module.css';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';
import { Home, List, Plus, Users, User } from 'lucide-react';
import Link from 'next/link';
import CategorySelectModal from '@/components/CategorySelectModal';

export default function CreateGatheringPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // TODO: 백엔드 이미지 업로드 로직 구현 후 활성화
  // 현재는 백엔드에서 이미지 업로드 API가 구현되지 않아서 이 기능은 동작하지 않습니다
  // 이미지 업로드 처리
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setError(null);

    try {
      // TODO: 백엔드 이미지 업로드 API 구현 후 활성화
      // 1. 백엔드에서 presigned URL 요청
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

      if (!presignedResponse.ok) {
        const errorRes = await presignedResponse.json().catch(() => ({}));
        throw new Error(errorRes?.error?.message || '업로드 URL 생성 실패');
      }

      const presignedData = await presignedResponse.json();
      console.log('Presigned URL 응답:', presignedData);
      
      const { uploadURL, key, url } = presignedData;

      if (!uploadURL) {
        throw new Error('업로드 URL을 받지 못했습니다.');
      }

      // 2. S3에 직접 업로드
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        if (uploadResponse.status === 413) throw new Error('업로드 가능한 파일 크기를 초과했습니다.');
        throw new Error(`이미지 업로드 실패: ${uploadResponse.status}`);
      }

      // 3. 업로드된 이미지 URL 추출
      // 응답에 url 필드가 있으면 사용, 없으면 presigned URL에서 추출
      let imageUrl: string;
      
      if (url) {
        // 응답에 직접 URL이 있는 경우 (가장 안전한 방법)
        imageUrl = url;
      } else {
        // presigned URL에서 실제 파일 URL 추출
        try {
          const urlObj = new URL(uploadURL);
          // origin과 pathname만 사용 (query string 제거)
          imageUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
          
          // URL이 유효한지 검증 (http:// 또는 https://로 시작하는지)
          if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            throw new Error('유효하지 않은 URL 형식');
          }
        } catch (urlError) {
          // URL 파싱 실패 시 query string만 제거
          console.warn('URL 파싱 실패, query string 제거 방식 사용:', urlError);
          imageUrl = uploadURL.split('?')[0];
          
          // 여전히 유효한 URL이 아니면 에러
          if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
            throw new Error('이미지 URL을 추출할 수 없습니다. 백엔드 응답을 확인해주세요.');
          }
        }
      }

      console.log('Presigned URL:', uploadURL);
      console.log('추출된 이미지 URL:', imageUrl);
      console.log('Key:', key);
      
      // TODO: 백엔드 구현 후 실제 URL 저장
      // 현재는 로컬 프리뷰만 표시 (실제 업로드는 백엔드 구현 후 가능)
      setImageUrl(imageUrl);
      setImageFile(file);

      // 프리뷰 생성 (로컬에서만 표시)
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      // TODO: 백엔드 구현 전까지는 에러를 무시하고 조용히 처리
      // 현재는 이미지 업로드가 선택사항이므로 에러를 표시하지 않음
      console.warn('이미지 업로드 실패 (백엔드 미구현, 선택사항이므로 무시):', err.message);
      // 프리뷰와 상태만 초기화 (에러 메시지는 표시하지 않음)
      setImageFile(null);
      setImagePreview('');
      setImageUrl(''); // 이미지 URL 초기화
      // setError는 호출하지 않음 (이미지 업로드는 선택사항이므로)
    } finally {
      setIsUploadingImage(false);
    }
  };

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      // 파일 크기 검증 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('이미지 크기는 10MB 이하여야 합니다.');
        return;
      }
      handleImageUpload(file);
    }
  };

  // AI 설명 자동생성 (일단 UI만, 나중에 API 연결)
  const handleAIGenerateDescription = async () => {
    if (!title || !category) {
      setError('모임 이름과 카테고리를 먼저 입력해주세요.');
      return;
    }

    setIsGeneratingDescription(true);
    setError(null);

    try {
      // TODO: 실제 AI API 호출
      // 임시로 더미 데이터 반환
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const dummyDescription = `${title}에 참여하실 분들을 모집합니다. ${category} 관련 활동을 함께 하며 즐겁게 소통할 수 있는 모임입니다. 많은 관심 부탁드립니다!`;
      setDescription(dummyDescription);
    } catch (err: any) {
      setError('AI 설명 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async () => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    // TODO: 백엔드 이미지 업로드 로직 구현 후 다시 활성화
    // 현재는 이미지 업로드 기능이 백엔드에서 구현되지 않아서 이미지 없이도 모임 생성 가능
    // if (!imageUrl) {
    //   setError('모임 이미지를 업로드해주세요.');
    //   return;
    // }

    setIsSubmitting(true);
    setError(null);

    // TODO: 백엔드 이미지 업로드 로직 구현 후 다시 활성화
    // 이미지 URL이 유효한 HTTP/HTTPS URL인지 확인하는 로직
    // 현재는 이미지 업로드가 선택사항이므로 이 검증을 비활성화
    let finalImageUrl = imageUrl || null; // 이미지가 없으면 null로 전송
    // if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    //   // 상대 경로인 경우 절대 URL로 변환 시도
    //   console.warn('이미지 URL이 절대 URL 형식이 아닙니다:', imageUrl);
    //   // 백엔드가 기대하는 형식에 맞게 처리
    //   // S3 URL인 경우 https:// 추가
    //   if (imageUrl.includes('.s3.') || imageUrl.includes('s3.amazonaws.com')) {
    //     finalImageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : `https://${imageUrl}`;
    //   }
    // }

    const payload = {
      title,
      imageUrl: finalImageUrl, // TODO: 백엔드 구현 후 필수 필드로 변경 (현재는 null 허용)
      category,
      capacity: capacity ?? 0,
      date: new Date(date).toISOString(),
      location,
      openChatUrl,
      description,
    };

    console.log('모임 생성 요청 payload:', payload);

    try {
      const res = await fetch('/api/v1/gatherings', {
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
        // 성공 시 홈화면으로 이동하며 완료 토스트 표시 (?created=1)
        router.push('/home?created=1');
      } else {
        let errorMessage = '모임 생성에 실패했습니다.';
        try {
          const errorBody = await res.json();
          console.error('모임 생성 실패 응답:', errorBody);
          errorMessage = errorBody?.error?.message || errorBody?.message || errorBody?.error || errorMessage;
          // validation 에러인 경우 상세 메시지 표시
          if (errorBody?.error?.details) {
            errorMessage += `: ${JSON.stringify(errorBody.error.details)}`;
          }
        } catch (e) {
          const errorText = await res.text().catch(() => '');
          console.error('모임 생성 실패 (JSON 파싱 실패):', errorText);
          errorMessage = `서버 오류 (${res.status})${errorText ? ': ' + errorText : ''}`;
        }
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('모임 생성 오류:', err);
      setError(err.message || '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>모임 생성</h1>

      <label className={styles.label}>모임 이름</label>
      <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 함께 성장하는 스터디" />

      {/* TODO: 백엔드 이미지 업로드 로직 구현 후 필수 필드로 변경 */}
      {/* 현재는 백엔드에서 이미지 업로드 API가 구현되지 않아 선택사항입니다 */}
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
          type="button"
          className={styles.imageUploadButton}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? '업로드 중...' : imagePreview ? '이미지 변경' : '이미지 업로드 (선택사항)'}
        </button>
        {imagePreview && (
          <div className={styles.imagePreview}>
            <img src={imagePreview} alt="미리보기" />
            <button
              type="button"
              className={styles.removeImageButton}
              onClick={() => {
                setImagePreview('');
                setImageUrl('');
                setImageFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className={styles.categorySection}>
        <label className={styles.label}>카테고리</label>
        <button type="button" className={styles.verifyButton} onClick={() => setIsCategoryModalOpen(true)}>
          {selectedCategoryList.length > 0 ? `카테고리 선택 (${selectedCategoryList.length}/1)` : '카테고리 선택 (1개 선택 가능)'}
        </button>

        {selectedCategoryList.length > 0 && (
          <div className={styles.selectedTags}>
            {selectedCategoryList.map((cat) => (
              <div key={cat} className={styles.tag}>
                <span>{cat}</span>
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={() => {
                    setSelectedCategoryList((prev) => prev.filter((c) => c !== cat));
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
            onClose={() => {
              if (selectedCategoryList.length > 0) {
                setCategory(selectedCategoryList[0]);
              } else {
                setCategory('');
              }
              setIsCategoryModalOpen(false);
            }}
            max={1}
          />
        )}
      </div>

      <label className={styles.label}>최대 인원</label>
      <input className={styles.input} type="number" value={capacity ?? ''} onChange={(e) => setCapacity(parseInt(e.target.value, 10))} placeholder="예: 10" />

      <label className={styles.label}>날짜</label>
      <input className={styles.input} type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />

      <label className={styles.label}>장소</label>
      <input className={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="모임 장소를 입력해주세요." />

      <label className={styles.label}>오픈채팅방 링크</label>
      <input className={styles.input} value={openChatUrl} onChange={(e) => setOpenChatUrl(e.target.value)} placeholder="https://open.kakao.com/..." />

      <div className={styles.descriptionSection}>
        <div className={styles.descriptionHeader}>
          <label className={styles.label}>모임 설명</label>
          <button
            type="button"
            className={styles.aiGenerateButton}
            onClick={handleAIGenerateDescription}
            disabled={isGeneratingDescription || !title || !category}
          >
            {isGeneratingDescription ? '생성 중...' : 'AI 자동생성'}
          </button>
        </div>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="어떤 활동을 하는 모임인지 알려주세요."
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