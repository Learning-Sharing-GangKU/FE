import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from './useProfile';
import { useUpdateProfile } from './useUpdateProfile';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useToast } from '@/hooks/useToast';
import type { UpdateProfilePayload } from '@/types/user';

const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,20}$/;

function validate(fields: {
  nickname: string;
  age: string;
  gender: string;
  enrollNumber: string;
  selectedCategories: string[];
}) {
  const errors: Record<string, string> = {};

  if (!fields.nickname) {
    errors.nickname = '닉네임을 입력해주세요.';
  } else if (!NICKNAME_REGEX.test(fields.nickname)) {
    errors.nickname = '닉네임은 한글, 영문, 숫자만 가능하며 2~20자여야 합니다.';
  }

  if (!fields.age) errors.age = '나이를 선택해주세요.';
  if (!fields.gender) errors.gender = '성별을 선택해주세요.';
  if (!fields.enrollNumber) errors.enrollNumber = '학번을 선택해주세요.';

  if (fields.selectedCategories.length > 3) {
    errors.categories = '관심 카테고리는 최대 3개까지 선택할 수 있습니다.';
  }

  return errors;
}

export function useProfileEditForm(userId: string) {
  const router = useRouter();
  const { profile, isLoading } = useProfile(userId);
  const { mutate: updateProfile, isPending } = useUpdateProfile(userId);
  const { mutate: uploadImage } = useImageUpload();
  const { toast, showToast } = useToast();

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageObjectKey, setProfileImageObjectKey] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [enrollNumber, setEnrollNumber] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [nicknameStatusText, setNicknameStatusText] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname);
    setAge(String(profile.age));
    setGender(profile.gender);
    setEnrollNumber(String(profile.enrollNumber));
    setSelectedCategories(profile.preferredCategories);
    setProfileImagePreview(profile.profileImageUrl ?? null);
  }, [profile]);

  const fields = { nickname, age, gender, enrollNumber, selectedCategories };
  const errors = validate(fields);

  const touch = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameStatusText('');
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    uploadImage(file, {
      onSuccess: ({ objectKey }) => setProfileImageObjectKey(objectKey),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const submitErrors = validate(fields);
    if (Object.keys(submitErrors).length > 0) {
      setTouched({ nickname: true, age: true, gender: true, enrollNumber: true });
      return;
    }

    const payload: UpdateProfilePayload = {};
    if (nickname !== profile.nickname) payload.nickname = nickname;
    if (Number(age) !== profile.age) payload.age = Number(age);
    if (gender !== profile.gender) payload.gender = gender as UpdateProfilePayload['gender'];
    if (Number(enrollNumber) !== profile.enrollNumber) payload.enrollNumber = Number(enrollNumber);
    if (JSON.stringify(selectedCategories) !== JSON.stringify(profile.preferredCategories))
      payload.preferredCategories = selectedCategories;
    if (profileImageObjectKey) payload.profileImageObjectKey = profileImageObjectKey;

    if (Object.keys(payload).length === 0) {
      showToast('변경된 내용이 없습니다.');
      return;
    }

    updateProfile(payload, {
      onSuccess: () => router.push(`/profile/${userId}`),
      onError: (err: any) => {
        if (err?.code === 'NICKNAME_ALREADY_EXISTS') {
          setNicknameStatusText('이미 사용 중인 닉네임입니다.');
        } else {
          showToast('수정에 실패했습니다.');
        }
      },
    });
  };

  return {
    profile,
    isLoading,
    profileImagePreview,
    nickname,
    age,
    gender,
    enrollNumber,
    selectedCategories,
    setSelectedCategories,
    setAge,
    setGender,
    setEnrollNumber,
    nicknameStatusText,
    errors,
    touched,
    touch,
    toast,
    isPending,
    handleNicknameChange,
    handleImageUpload,
    handleSubmit,
  };
}
