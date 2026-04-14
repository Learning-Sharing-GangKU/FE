import { useImageUpload } from '@/hooks/useImageUpload';

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  '게임':    '/images/게임.jpeg',
  '공연/축제': '/images/공연:축제 .png',
  '공연:축제': '/images/공연:축제 .png',
  '독서':    '/images/독서.png',
  '반려동물': '/images/반려동물.jpg',
  '봉사':    '/images/봉사.png',
  '사진':    '/images/사진.jpeg',
  '스터디':  '/images/스터디.jpeg',
  '스포츠':  '/images/스포츠.jpg',
  '여행':    '/images/여행.jpg',
  '요리':    '/images/요리.png',
  '운동':    '/images/운동.jpg',
  '음악':    '/images/음악.png',
  '친목':    '/images/친목.png',
};

export function useDefaultCategoryImage() {
  const { mutateAsync: uploadImage } = useImageUpload();

  const getDefaultImageObjectKey = async (category: string): Promise<string | null> => {
    const imagePath = CATEGORY_IMAGE_MAP[category.trim()];
    if (!imagePath) return null;

    try {
      const res = await fetch(imagePath);
      if (!res.ok) return null;
      const blob = await res.blob();
      const ext = imagePath.split('.').pop() ?? 'jpg';
      const file = new File([blob], `default_${category.trim()}.${ext}`, { type: blob.type });
      const { objectKey } = await uploadImage(file);
      return objectKey;
    } catch {
      return null;
    }
  };

  return { getDefaultImageObjectKey };
}
