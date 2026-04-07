"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import styles from "./AiIntroModal.module.css";

interface AiIntroModalProps {
  onClose: () => void;
  onSubmit: (keywords: string) => void;
}

export default function AiIntroModal({
  onClose,
  onSubmit,
}: AiIntroModalProps) {
  const [keywords, setKeywords] = useState("");

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>AI로 모임 설명 만들기</h2>

        <p className={styles.subtitle}>
          모임 설명에 포함하고 싶은 키워드를 입력해주세요.
        </p>

        <input
          className={styles.input}
          placeholder="예: 서울, 20대, 주말, 맛집탐방"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />

        <p className={styles.helper}>키워드는 쉼표로 구분해주세요.</p>

        <div className={styles.notice}>
          <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>AI 생성에는 <strong>약 30초~1분 정도</strong> 소요될 수 있습니다. 진행 중에는 창을 닫지 말고 잠시만 기다려주세요!</span>
        </div>

        <div className={styles.buttons}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={() => onSubmit(keywords)}
          >
            생성하기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
