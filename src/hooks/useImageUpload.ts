import { useMutation } from '@tanstack/react-query';
import { getPresignedUrl, uploadImageToS3 } from '@/api/image';

/** 이미지 업로드 (Presigned URL 발급 → S3 업로드) */
export function useImageUpload() {
  return useMutation({
    mutationFn: async (file: File) => {
      const { uploadUrl, objectKey, fileUrl } = await getPresignedUrl(file.name, file.type);
      await uploadImageToS3(uploadUrl, file);
      return { objectKey, fileUrl };
    },
  });
}
