'use client';

import styles from './ConfirmModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText: string;
  cancelText?: string;
  description?: string;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  cancelText = '취소',
  description,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.buttons}>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            {confirmText}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            {cancelText}
          </button>
        </div>
        {description && (
          <p className={styles.description}>{description}</p>
        )}
      </div>
    </div>
  );
}
