/**
 * 카테고리 선택 모달 컴포넌트
 * 
 * 주요 기능:
 * 1. 백엔드에서 카테고리 목록 동적 로드
 * 2. 최대 3개까지 카테고리 선택 제한
 * 3. 선택된 카테고리 시각적 표시 (체크마크)
 * 4. 선택 개수 실시간 카운터 표시
 * 5. 로딩 상태 및 에러 처리
 */
'use client'

import React, { useState, useEffect } from 'react'
import styles from './CategorySelectModal.module.css'

// Props 타입 정의
/**
 * @interface Props
 * @property {string[]} selected - 현재 선택된 카테고리 목록
 * @property {React.Dispatch<React.SetStateAction<string[]>>} setSelected - 선택된 카테고리 상태 업데이트 함수
 * @property {() => void} onClose - 모달 닫기 함수
 */
type Props = {
    selected: string[]
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
    onClose: () => void
}

export default function CategorySelectModal({ selected, setSelected, onClose }: Props) {
  // ===== 상태 관리 =====
  const [categories, setCategories] = useState<string[]>([]) // 백엔드에서 가져온 카테고리 목록
  const [loading, setLoading] = useState(true) // 카테고리 목록 로딩 상태
  const [error, setError] = useState('') // 에러 메시지

  /**
   * 컴포넌트 마운트 시 카테고리 목록을 백엔드에서 가져오기
   * 
   * 동작 과정:
   * 1. /api/categories 엔드포인트 호출
   * 2. 성공 시: 받은 카테고리 목록으로 상태 업데이트
   * 3. 실패 시: 기본 카테고리 사용 (운동, 스터디, 모임)
   * 4. 로딩 상태 관리
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 백엔드 API 호출
        const response = await fetch('http://localhost:8080/api/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('카테고리 목록을 가져오는데 실패했습니다.')
        }

        const data = await response.json()
        setCategories(data.categories || [])
      } catch (err: any) {
        setError(err.message)
        // 에러 발생 시 기본 카테고리 사용 (fallback)
        setCategories(['운동', '스터디', '모임'])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  /**
   * 카테고리 선택/해제 처리 함수
   * 
   * @param category 클릭된 카테고리명
   * 
   * 동작 로직:
   * 1. 이미 선택된 카테고리면 선택 해제 (토글)
   * 2. 선택되지 않은 카테고리면 최대 3개 제한 확인 후 선택
   * 3. 3개 초과 시 선택 불가 (UI에서 비활성화 표시)
   */
  const handleCategoryClick = (category: string) => {
    if (selected.includes(category)) {
      // 이미 선택된 카테고리면 배열에서 제거
      setSelected(prev => prev.filter(cat => cat !== category))
    } else {
      // 최대 3개까지만 선택 가능
      if (selected.length < 3) {
        setSelected(prev => [...prev, category])
      }
      // 3개 초과 시 아무 동작 안함 (UI에서 비활성화됨)
    }
  }

  // ===== 로딩 상태 렌더링 =====
  if (loading) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3 className={styles.title}>카테고리 선택</h3>
          <p className={styles.loading}>카테고리를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // ===== 메인 모달 렌더링 =====
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 모달 헤더 */}
        <h3 className={styles.title}>카테고리 선택</h3>
        
        {/* 사용자 안내 메시지 */}
        <p className={styles.subtitle}>
          관심 카테고리를 선택해주세요 (최대 3개)
        </p>
        
        {/* 선택 개수 카운터 */}
        <p className={styles.counter}>
          {selected.length}/3 선택됨
        </p>
        
        {/* 에러 메시지 표시 */}
        {error && <p className={styles.error}>⚠️ {error}</p>}
        
        {/* 카테고리 목록 */}
        <ul className={styles.list}>
          {categories.map((category) => {
            const isSelected = selected.includes(category) // 선택 상태 확인
            const isDisabled = !isSelected && selected.length >= 3 // 비활성화 상태 확인
            
            return (
              <li
                key={category}
                className={`${styles.item} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
                {/* 선택된 카테고리에 체크마크 표시 */}
                {isSelected && <span className={styles.checkmark}>✓</span>}
              </li>
            )
          })}
        </ul>
        
        {/* 완료 버튼 */}
        <div className={styles.buttonContainer}>
          <button className={styles.confirmButton} onClick={onClose}>
            완료
          </button>
        </div>
      </div>
    </div>
  )
}