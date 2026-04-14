import { useImageUpload } from '@/hooks/useImageUpload';

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  '게임':    '/images/game.jpeg',
  '공연_축제': '/images/festival.jpg',
  '독서':    '/images/reading.jpg',
  '반려동물': '/images/pet.jpg',
  '봉사':    '/images/volunteer.jpg',
  '사진':    '/images/photo.jpeg',
  '스터디':  '/images/study.jpeg',
  '스포츠':  '/images/sports.jpg',
  '여행':    '/images/travel.jpg',
  '요리':    '/images/cooking.jpg',
  '운동':    '/images/exercise.jpg',
  '음악':    '/images/music.jpg',
  '친목':    '/images/social.jpg',
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
