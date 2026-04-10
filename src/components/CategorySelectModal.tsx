'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from './CategorySelectModal.module.css';
import { getCategories } from '@/api/gathering';

type Props = {
  mode: 'preference' | 'group'; // preference: 최대 3개, group: 1개 필수
  initialSelected?: string[];
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
};

export default function CategorySelectModal({
  mode,
  initialSelected = [],
  onConfirm,
  onClose,
}: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const categories = data?.categories ?? [];

  useEffect(() => {
    setSelected(initialSelected);
  }, [initialSelected]);

  const maxSelection = mode === 'preference' ? 3 : 1;
  const isPreference = mode === 'preference';

  const handleToggle = (category: string) => {
    if (selected.includes(category)) {
      setSelected((prev) => prev.filter((c) => c !== category));
    } else if (mode === 'group') {
      setSelected([category]);
    } else if (selected.length < maxSelection) {
      setSelected((prev) => [...prev, category]);
    } else {
      // preference 모드에서 최대 개수 초과 시 가장 먼저 선택한 항목 제거 후 추가
      setSelected((prev) => [...prev.slice(1), category]);
    }
  };

  const handleConfirm = () => {
    if (mode === 'group' && selected.length === 0) {
      alert('카테고리를 1개 선택해주세요.');
      return;
    }
    onConfirm(selected);
    onClose();
  };

  const isConfirmDisabled = mode === 'group' && selected.length === 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isPreference ? '선호 카테고리를 선택해주세요' : '모임 카테고리를 선택해주세요'}
          </h2>
          <p className={styles.subtitle}>
            {isPreference ? `최대 ${maxSelection}개까지 선택 가능` : '1개 필수 선택'}
          </p>
          <span className={styles.counter}>
            {selected.length}/{maxSelection} 선택됨
          </span>
        </div>

        {/* 카테고리 버블 */}
        <div className={styles.body}>
          <div className={styles.row} style={{ flexWrap: 'wrap' }}>
            {categories.map((category) => {
              const isSelected = selected.includes(category);

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleToggle(category)}
                  className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* 완료 버튼 */}
        <div className={styles.footer}>
          <button
            className={`${styles.confirmButton} ${isConfirmDisabled ? styles.confirmDisabled : ''}`}
            disabled={isConfirmDisabled}
            onClick={handleConfirm}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
