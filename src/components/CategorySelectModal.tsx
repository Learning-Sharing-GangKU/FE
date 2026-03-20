'use client';

import styles from './CategorySelectModal.module.css';

// TODO: src/api에서 카테고리 목록 fetch 예정. 현재는 하드코딩 사용.
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
  selected: string[];
  setSelected: (selected: string[] | ((prev: string[]) => string[])) => void;
  onClose: () => void;
  max?: number;
};

export default function CategorySelectModal({ selected, setSelected, onClose, max = 3 }: Props) {
  const handleToggle = (category: string) => {
    if (selected.includes(category)) {
      setSelected((prev) => prev.filter((c) => c !== category));
    } else if (selected.length < max) {
      setSelected((prev) => [...prev, category]);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h2 className={styles.title}>선호 카테고리를 선택해주세요</h2>
          <p className={styles.subtitle}>최대 {max}개까지 선택 가능</p>
          <span className={styles.counter}>{selected.length}/{max} 선택됨</span>
        </div>

        {/* 카테고리 버블 */}
        <div className={styles.body}>
          {CATEGORY_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((category) => {
                const isSelected = selected.includes(category);
                const isDisabled = !isSelected && selected.length >= max;

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
          <button className={styles.confirmButton} onClick={onClose}>
            완료
          </button>
        </div>
      </div>
    </div>
  );
}
