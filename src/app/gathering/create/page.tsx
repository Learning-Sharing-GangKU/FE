'use client';

import { useState } from 'react';
import styles from './create.module.css';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';
import { Home, List, Plus, Users, User } from 'lucide-react';
import Link from 'next/link';
import CategorySelectModal from '@/components/CategorySelectModal';

export default function CreateGatheringPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryList, setSelectedCategoryList] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [openChatUrl, setOpenChatUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const payload = {
      title,
      imageUrl,
      category,
      capacity: capacity ?? 0,
      date: new Date(date).toISOString(),
      location,
      openChatUrl,
      description,
    };

    try {
      const res = await fetch('/api/v1/gatherings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        const data = await res.json();
        router.push(`/gathering/${data.id}`);
      } else {
        const errorBody = await res.json();
        setError(errorBody?.error?.message || '모임 생성 실패');
      }
    } catch (err) {
      setError('요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>모임 생성</h1>

      <label className={styles.label}>모임 이름</label>
      <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 함께 성장하는 스터디" />

      <label className={styles.label}>표 사진 URL</label>
      <input className={styles.input} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />

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

      <label className={styles.label}>모임 설명</label>
      <textarea className={styles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="어떤 활동을 하는 모임인지 알려주세요." />

      {error && <div className={styles.error}>{error}</div>}

      <button className={styles.submitButton} onClick={handleSubmit}>모임 만들기</button>

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