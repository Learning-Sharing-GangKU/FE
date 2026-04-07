import { apiFetch } from '@/api/client';

/** Presigned URL 발급 응답 */
export interface PresignedUrlResponse {
  objectKey: string;
  uploadUrl: string;
  fileUrl: string;
  expiresIn: number;
}

/** POST /api/v1/objects/presigned-url — Presigned URL 발급 */
export async function getPresignedUrl(
  fileName: string,
  fileType: string
): Promise<PresignedUrlResponse> {
  return apiFetch('/api/v1/objects/presigned-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, fileType }),
  });
}

/** PUT {uploadUrl} — S3 이미지 업로드 */
export async function uploadImageToS3(
  uploadUrl: string,
  file: File
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.status}`);
  }
}
