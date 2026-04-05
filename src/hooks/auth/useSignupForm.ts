import { useState } from 'react';
import { useSignup, useSendEmailVerification, useConfirmEmailVerification } from './useSignup';
import { useImageUpload } from '@/hooks/useImageUpload';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,20}$/;

function validate(fields: {
  emailId: string;
  emailVerified: boolean;
  password: string;
  passwordConfirm: string;
  nickname: string;
  age: string;
  gender: string;
  enrollNumber: string;
  selectedCategories: string[];
}) {
  const errors: Record<string, string> = {};

  if (!fields.emailId) {
    errors.email = '이메일을 입력해주세요.';
  } else if (!fields.emailVerified) {
    errors.email = '이메일 인증을 완료해주세요.';
  }

  if (!fields.password) {
    errors.password = '비밀번호를 입력해주세요.';
  } else if (!PASSWORD_REGEX.test(fields.password)) {
    errors.password = '비밀번호는 8자 이상, 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.';
  }

  if (!fields.passwordConfirm) {
    errors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
  } else if (fields.password !== fields.passwordConfirm) {
    errors.passwordConfirm = '비밀번호 확인이 일치하지 않습니다.';
  }

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

export function useSignupForm() {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [enrollNumber, setEnrollNumber] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [profileImageObjectKey, setProfileImageObjectKey] = useState<string | null>(null);

  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailStatusText, setEmailStatusText] = useState('');
  const [nicknameStatusText, setNicknameStatusText] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { mutate: signupMutate, isPending, reset: resetSignup } = useSignup();
  const { mutate: sendVerification, isPending: isSending, errorCode: emailSendErrorCode, reset: resetEmailSend } = useSendEmailVerification();
  const { mutate: confirmVerification, isPending: isConfirming } = useConfirmEmailVerification();
  const { mutate: uploadImage } = useImageUpload();

  const isEmailDuplicate = emailSendErrorCode === 'EMAIL_ALREADY_EXISTS';

  const fields = {
    emailId,
    emailVerified: emailVerified && !isEmailDuplicate,
    password,
    passwordConfirm,
    nickname,
    age,
    gender,
    enrollNumber,
    selectedCategories,
  };
  const errors = validate(fields);
  const isFormValid = Object.keys(errors).length === 0;

  const touch = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleEmailIdChange = (value: string) => {
    setEmailId(value);
    setEmailSent(false);
    setEmailVerified(false);
    setEmailStatusText('');
    resetEmailSend();
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameStatusText('');
    resetSignup();
  };

  const handleSendEmail = () => {
    sendVerification(`${emailId}@konkuk.ac.kr`, {
      onSuccess: () => {
        setEmailSent(true);
        setEmailStatusText('메일 발송이 완료되었습니다. 이메일 링크를 클릭하시면 인증이 완료됩니다.');
      },
      onError: (error: any) => {
        const msg =
          error?.code === 'EMAIL_ALREADY_EXISTS'
            ? '이미 가입된 이메일입니다.'
            : `메일 발송에 실패했습니다. (${error.message})`;
        setEmailStatusText(msg);
      },
    });
  };

  const handleConfirmEmail = () => {
    confirmVerification(undefined, {
      onSuccess: () => {
        setEmailVerified(true);
        setEmailStatusText('이메일 인증이 완료되었습니다. ✅');
      },
      onError: () => {
        setEmailStatusText('이메일 인증을 완료해주세요. 링크를 클릭한 후 다시 시도해주세요.');
      },
    });
  };

  const handleImageUpload = (file: File, onPreview: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => onPreview(reader.result as string);
    reader.readAsDataURL(file);
    uploadImage(file, {
      onSuccess: ({ objectKey }) => setProfileImageObjectKey(objectKey),
    });
  };

  const handleConfirmSignup = () => {
    signupMutate(
      {
        email: `${emailId}@konkuk.ac.kr`,
        password,
        nickname,
        age: Number(age),
        gender: gender as 'MALE' | 'FEMALE',
        enrollNumber: Number(enrollNumber),
        preferredCategories: selectedCategories,
        ...(profileImageObjectKey && { profileImageObjectKey }),
      },
      {
        onError: (error: any) => {
          if (error?.code === 'NICKNAME_ALREADY_EXISTS') {
            setNicknameStatusText('이미 사용 중인 닉네임입니다.');
          }
        },
      }
    );
  };

  return {
    // 필드 상태
    emailId,
    password,
    passwordConfirm,
    nickname,
    age,
    gender,
    enrollNumber,
    selectedCategories,
    setSelectedCategories,
    setPassword,
    setPasswordConfirm,
    setAge,
    setGender,
    setEnrollNumber,
    // 이메일 인증 상태
    emailSent,
    emailVerified,
    emailStatusText,
    isEmailDuplicate,
    // 서버 에러 상태
    nicknameStatusText,
    // 유효성 검사
    errors,
    isFormValid,
    touched,
    touch,
    // 로딩 상태
    isPending,
    isSending,
    isConfirming,
    // 핸들러
    handleEmailIdChange,
    handleNicknameChange,
    handleSendEmail,
    handleConfirmEmail,
    handleImageUpload,
    handleConfirmSignup,
  };
}
