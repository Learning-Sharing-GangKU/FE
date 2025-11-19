import React from 'react';
import styles from './roomDetail.module.css';

export function ChatLink({ url, visible }: { url?: string | null; visible: boolean }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  if (!visible) return null;
  return (
    <div className={styles.chatLinkWrap}>
      <label className={styles.chatLabel}>모임 대화방 링크</label>
      <div className={styles.chatFieldRow}>
        <input ref={inputRef} className={styles.linkField} value={url || ''} readOnly />
        <button
          className={styles.copyButton}
          onClick={() => {
            if (!inputRef.current) return;
            navigator.clipboard.writeText(inputRef.current.value);
          }}
        >
          복사
        </button>
      </div>
    </div>
  );
}

