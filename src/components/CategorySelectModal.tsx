'use client';

import { useState, useEffect } from 'react';
import styles from './CategorySelectModal.module.css';

const CATEGORY_ROWS = [
  ['운동/스포츠', '맛집 탐방'],
  ['아웃도어/여행', '문화/공연'],
  ['자기계발', '독서', '음악/악기'],
  ['외국어', '봉사활동', '사교/인맥'],
  ['게임/오락', '요리/베이킹'],
  ['반려동물', '재테크/투자'],
  ['영화/드라마'],
];

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
          {CATEGORY_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((category) => {
                const isSelected = selected.includes(category);
                const isDisabled = !isSelected && selected.length >= maxSelection;

                return (
                  <button
                    key={category}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleToggle(category)}
                    className={`${styles.chip} ${isSelected ? styles.chipSelected : ''} ${isDisabled ? styles.chipDisabled : ''}`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          ))}
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
