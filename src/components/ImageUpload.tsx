'use client';

import { useId, ChangeEvent } from 'react';
import { Camera, Upload } from 'lucide-react';
import { toast } from 'sonner';
import styles from './ImageUpload.module.css';

type Props = {
  label?: string;
  imageUrl?: string | null;
  onImageChange: (file: File | null, imageUrl: string | null) => void;
  description?: string;
  subDescription?: string;
  accept?: string;
  maxSizeMB?: number;
};

export default function ImageUpload({
  label = '이미지',
  imageUrl,
  onImageChange,
  description = '사진을 등록해주세요',
  subDescription = 'JPG, PNG 파일 (최대 5MB)',
  accept = 'image/*',
  maxSizeMB = 5,
}: Props) {
  const inputId = useId();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.row}>
        <div
          className={styles.circle}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt={label} className={styles.img} />
              <div className={styles.overlay}>
                <Camera size={24} color="white" />
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <Upload size={24} />
              <span>업로드</span>
            </div>
          )}
          <input
            id={inputId}
            type="file"
            accept={accept}
            hidden
            onChange={handleFileChange}
          />
        </div>
        <div className={styles.hint}>
          <p className={styles.hintMain}>{description}</p>
          <p className={styles.hintSub}>{subDescription}</p>
        </div>
      </div>
    </div>
  );
}
