/*
모임 생성 실패 / 필수 정보 누락 시 안내 모달
*/
"use client";

import styles from "./GatheringFailedModal.module.css";

interface GatheringFailedModalProps {
  message: string;
  onClose: () => void;
}

export default function GatheringFailedModal({
    message,
    onClose,
}: GatheringFailedModalProps) {
  return (
    <div className={styles.overlay}>
        <div className={styles.modal}>
            <h2 className={styles.title}>정보가 더 필요해요!</h2>

            <p className={styles.subtitle}>{message}</p>

            <button className={styles.button} onClick={onClose}>
                확인
            </button>
        </div>
    </div>
  );
}
