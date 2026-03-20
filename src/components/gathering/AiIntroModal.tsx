"use client";

import { useState } from "react";
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

  return (
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

        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={onClose}>
            취소
          </button>
          <button
            className={styles.confirm}
            onClick={() => onSubmit(keywords)}
          >
            생성하기
          </button>
        </div>
      </div>
    </div>
  );
}
