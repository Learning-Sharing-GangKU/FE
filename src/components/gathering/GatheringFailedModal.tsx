/*
모임 생성 실패 / 필수 정보 누락 시 안내 모달
*/
"use client";

import styles from "./GatheringFailedModal.module.css";

interface GatheringFailedModalProps {
  title?: string;
  message: string;
  onClose: () => void;
}

export default function GatheringFailedModal({
    title,
    message,
    onClose,
}: GatheringFailedModalProps) {
  return (
    <div className={styles.overlay}>
        <div className={styles.modal}>
            <h2 className={styles.title}>{title}</h2>

            <p className={styles.subtitle}>{message}</p>

            <button className={styles.button} onClick={onClose}>
                확인
            </button>
        </div>
    </div>
  );
}
