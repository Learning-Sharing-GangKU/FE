import { useState } from 'react';
import { useReviewToggle } from './useReviewToggle';
import { useCreateReview } from './useCreateReview';

export function useReviewSection(
  userId: string,
  reviewPublic: boolean | undefined,
  showToast: (message: string) => void,
) {
  const reviewToggle = useReviewToggle(userId, reviewPublic);
  const { mutate: createReviewMutate } = useCreateReview(userId);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleSubmitReview = (rating: number, content: string) => {
    createReviewMutate({ rating, comment: content }, {
      onSuccess: () => {
        setShowReviewModal(false);
        showToast('리뷰가 등록되었습니다.');
      },
      onError: (err: any) => {
        if (err?.code === 'NO_PERMISSION_TO_WRITE_REVIEW') {
          showToast('같은 모임에 참여한 사용자만 리뷰를 작성할 수 있습니다.');
        } else {
          showToast(err?.message ?? '리뷰 등록에 실패했습니다.');
        }
      },
    });
  };

  return {
    reviewToggle,
    showReviewModal,
    setShowReviewModal,
    handleSubmitReview,
  };
}
