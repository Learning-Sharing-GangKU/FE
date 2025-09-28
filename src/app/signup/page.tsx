'use client'

import { useState } from 'react'
import CategorySelectModal from '@/components/CategorySelectModal'
import styles from './signup.module.css'

/**
 * 회원가입 페이지 컴포넌트
 * 
 * 주요 기능:
 * 1. 이메일 인증 (건국대학교 도메인 자동 추가)
 * 2. 프로필 이미지 업로드 (S3 presigned URL 방식)
 * 3. 카테고리 선택 (최대 3개, 태그 형식 표시)
 * 4. 사용자 정보 입력 및 검증
 * 5. 회원가입 API 호출
 */
export default function SignupPage() {
    // ===== 이메일 관련 상태 =====
    const [email, setEmail] = useState('') // 사용자 입력 이메일 (도메인 제외)
    const [emailSent, setEmailSent] = useState(false) // 이메일 발송 완료 여부
    const [emailVerified, setEmailVerified] = useState(false) // 이메일 인증 완료 여부
    const [emailVerifyMessage, setEmailVerifyMessage] = useState('') // 이메일 인증 관련 메시지

    // ===== 비밀번호 관련 상태 =====
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // ===== 사용자 정보 상태 =====
    const [nickname, setNickname] = useState('')
    const [studentId, setStudentId] = useState('') // 학번 (10~29)
    const [age, setAge] = useState('') // 나이 (14~100)
    const [gender, setGender] = useState('') // 성별 (MALE/FEMALE)

    // ===== 프로필 이미지 관련 상태 =====
    const [profileImage, setProfileImage] = useState<File | null>(null) // 선택된 이미지 파일

    // ===== 카테고리 선택 관련 상태 =====
    const [preferredCategories, setPreferredCategories] = useState<string[]>([]) // 선택된 카테고리 목록 (최대 3개)
    const [showCategoryModal, setShowCategoryModal] = useState(false) // 카테고리 선택 모달 표시 여부

    // ===== UI 상태 =====
    const [errors, setErrors] = useState<{ [key: string]: string }>({}) // 폼 검증 에러 메시지
    const [toast, setToast] = useState('') // 토스트 메시지

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
        
            // S3 직접 업로드 처리
            try {
                // 1. 백엔드에서 presigned URL 요청
                const presignedResponse = await fetch('/api/upload/presigned-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                    }),
                })

                if (!presignedResponse.ok) {
                    const errorRes = await presignedResponse.json()
                    throw new Error(errorRes?.error?.message || '업로드 URL 생성 실패')
                }

                const { uploadURL, key } = await presignedResponse.json()

                // 2. S3에 직접 업로드
                const uploadResponse = await fetch(uploadURL, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                    },
                })

                if (!uploadResponse.ok) {
                    throw new Error('이미지 업로드 실패')
                }

                // 3. 업로드 성공 시 파일과 메타데이터 저장
                setProfileImage(file)
                setErrors((prev) => ({ ...prev, profileImage: '' }))
                
                // 업로드된 이미지 정보를 상태에 저장 (회원가입 시 사용)
                const imageInfo = {
                    bucket: 'app-user-profile', // 백엔드에서 제공하거나 고정값
                    key: key,
                    url: uploadURL.split('?')[0], // presigned URL에서 실제 URL 추출
                }
                
                // 임시로 sessionStorage에 저장 (회원가입 시 사용)
                sessionStorage.setItem('profileImageInfo', JSON.stringify(imageInfo))
                
            } catch (err: any) {
                setErrors({ profileImage: err.message })
            }
        }
    }

    /**
     * 이메일 인증 발송 처리 함수
     * 
     * API 명세에 따른 응답 처리:
     * - 200: 성공 메시지 표시
     * - 400: 이메일 형식 오류
     * - 409: 이미 가입된 이메일
     * - 500: 서버 오류
     */
    const handleSendVerification = async () => {
        if (!email) {
            setEmailVerifyMessage('이메일을 입력해주세요.')
            return
        }

        try {
            const fullEmail = `${email}@konkuk.ac.kr`
            const res = await fetch('/api/v1/auth/email/verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include', // 쿠키 포함 (signup_session)
                body: JSON.stringify({ email: fullEmail }),
            })

            const data = await res.json()

            if (res.ok) {
                // 200 OK - 성공 응답
                setEmailSent(true)
                setEmailVerifyMessage('✅ 인증 메일을 전송했습니다. 이메일을 확인해주세요.')
            } else {
                // 에러 응답 처리
                const errorCode = data?.error?.code
                const errorMessage = data?.error?.message

                switch (res.status) {
                    case 400:
                        // INVALID_EMAIL_FORMAT
                        setEmailVerifyMessage(`❌ ${errorMessage || '이메일 형식이 올바르지 않습니다.'}`)
                        break
                    case 409:
                        // EMAIL_CONFLICT
                        setEmailVerifyMessage(`⚠️ ${errorMessage || '이미 가입된 이메일이 있습니다.'}`)
                        break
                    case 500:
                        // INTERNAL_SERVER_ERROR
                        setEmailVerifyMessage(`🔧 ${errorMessage || '서버 오류로 인해 이메일을 전송하지 못했습니다. 잠시 후 다시 시도해주세요.'}`)
                        break
                    default:
                        setEmailVerifyMessage(`❌ ${errorMessage || '이메일 인증 요청 실패'}`)
                }
            }
        } catch (err: any) {
            // 네트워크 오류 등 예상치 못한 에러
            setEmailVerifyMessage('❌ 네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
    }

    /**
     * 이메일 인증 확인 처리 함수
     * 
     * API 명세에 따른 응답 처리:
     * - 200: 인증 완료, 다음 단계 진행
     * - 400: 세션/이메일 관련 오류
     * - 410: 토큰 만료 또는 사용됨
     * - 500: 서버 오류
     */
    const handleCheckVerification = async () => {
        try {
            const res = await fetch('/api/v1/auth/email/verification/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                credentials: 'include', // 쿠키 포함 (signup_session)
                body: JSON.stringify({}), // 바디 없음
            })

            const data = await res.json()

            if (res.ok) {
                // 200 OK - 인증 완료
                setEmailVerified(true)
                setEmailVerifyMessage('✅ 이메일 인증이 완료되었습니다.')
            } else {
                // 에러 응답 처리
                const errorCode = data?.error?.code
                const errorMessage = data?.error?.message

                switch (res.status) {
                    case 400:
                        // 400 Bad Request - 다양한 오류 케이스
                        switch (errorCode) {
                            case 'INVALID_SESSION':
                                setEmailVerifyMessage('❌ 유효한 가입 세션이 없습니다. 다시 시작해주세요.')
                                break
                            case 'VERIFICATION_NOT_STARTED':
                                setEmailVerifyMessage('❌ 인증 메일 발송 기록이 없습니다. 먼저 인증 메일을 발송해주세요.')
                                break
                            case 'EMAIL_MISMATCH':
                                setEmailVerifyMessage('❌ 세션의 이메일과 인증된 이메일이 일치하지 않습니다.')
                                break
                            default:
                                setEmailVerifyMessage(`❌ ${errorMessage || '인증 확인 실패'}`)
                        }
                        break
                    case 410:
                        // 410 Gone - 토큰 만료 또는 사용됨
                        setEmailVerifyMessage('⚠️ 인증 토큰이 만료되었거나 이미 사용되었습니다. 인증 메일을 다시 발송해주세요.')
                        // 토큰 만료 시 인증 상태 초기화
                        setEmailSent(false)
                        setEmailVerified(false)
                        break
                    case 500:
                        // 500 Internal Server Error
                        setEmailVerifyMessage(`🔧 ${errorMessage || '이메일 인증 확인 중 오류가 발생했습니다.'}`)
                        break
                    default:
                        setEmailVerifyMessage(`❌ ${errorMessage || '인증 확인 실패'}`)
                }
            }
        } catch (err: any) {
            // 네트워크 오류 등 예상치 못한 에러
            setEmailVerifyMessage('❌ 네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: { [key: string]: string } = {}
        if (!email) newErrors.email = '이메일을 입력해주세요.'
        if (!password) newErrors.password = '비밀번호를 입력해주세요.'
        if (!confirmPassword) newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.'
        if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
        if (!nickname) newErrors.nickname = '닉네임을 입력해주세요.'
        if (!age) newErrors.age = '나이를 선택해주세요.'
        if (!gender) newErrors.gender = '성별을 선택해주세요.'
        if (!studentId) newErrors.studentId = '학번을 선택해주세요.'
        if (preferredCategories.length === 0) newErrors.categories = '카테고리를 선택해주세요.'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // 업로드된 프로필 이미지 정보 가져오기
        let profileImagePayload = undefined
        if (profileImage) {
            const imageInfo = sessionStorage.getItem('profileImageInfo')
            if (imageInfo) {
                profileImagePayload = JSON.parse(imageInfo)
            } else {
                setErrors({ profileImage: '이미지 업로드 정보를 찾을 수 없습니다. 다시 업로드해주세요.' })
                return
            }
        }

        const body = {
            email: `${email}@konkuk.ac.kr`,
            password,
            profileImage: profileImagePayload,
            age: Number(age),
            gender,
            enrollNumber: Number(studentId),
            nickname,
            preferredCategories,
        }

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                const errorRes = await res.json()
                throw new Error(errorRes?.error?.message || '회원가입 실패')
            }

            setToast('회원가입에 성공했습니다!')
            setErrors({})
            setTimeout(() => setToast(''), 3000)
        } catch (err: any) {
            setErrors({ general: err.message })
        }
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>회원가입</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* 이메일 입력 */}
                <div className={styles.row}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="이메일을 입력하세요"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value)
                            setEmailSent(false)
                            setEmailVerified(false)
                            setEmailVerifyMessage('')
                        }}
                    />
                    <span className={styles.domain}>@konkuk.ac.kr</span>
                    {emailVerified ? (
                        <button type="button" className={styles.verifiedButton} disabled>
                            인증 완료
                        </button>
                    ) : emailSent ? (
                        <button type="button" className={styles.verifyButton} onClick={handleCheckVerification}>
                            인증 확인
                        </button>
                    ) : (
                        <button type="button" className={styles.verifyButton} onClick={handleSendVerification}>
                            이메일 인증
                        </button>
                    )}
                </div>
                {emailVerifyMessage && (
                    <p className={styles.emailMessage}>{emailVerifyMessage}</p>
                )}

                <input
                    type="password"
                    className={styles.input}
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                    }}
                />
                {errors.password && <p className={styles.error}>{errors.password}</p>}

                <input
                    type="password"
                    className={styles.input}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                    }}
                />
                {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}

                <div className={styles.avatarUpload}>
                    <img
                        src={profileImage ? URL.createObjectURL(profileImage) : '/images/logo.png'}
                        alt="프로필"
                        className={styles.avatarPreview}
                    />
                    <label className={styles.uploadLabel}>
                        <input 
                            type="file" 
                            accept="image/*"
                            hidden 
                            onChange={handleImageChange} 
                        />📷
                    </label>
                </div>
                {errors.profileImage && <p className={styles.error}>{errors.profileImage}</p>}

                <div className={styles.row}>
                    <select
                        className={styles.select}
                        value={age}
                        onChange={(e) => {
                            setAge(e.target.value)
                            if (errors.age) setErrors((prev) => ({ ...prev, age: '' }))
                        }}
                    >
                        <option value="">나이</option>
                        {Array.from({ length: 87 }, (_, i) => (
                            <option key={i} value={i + 14}>{i + 14}</option>
                        ))}
                    </select>

                    <select
                        className={styles.select}
                        value={gender}
                        onChange={(e) => {
                            setGender(e.target.value)
                            if (errors.gender) setErrors((prev) => ({ ...prev, gender: '' }))
                        }}
                    >
                        <option value="">성별</option>
                        <option value="MALE">남성</option>
                        <option value="FEMALE">여성</option>
                    </select>
                </div>
                {errors.age && <p className={styles.error}>{errors.age}</p>}
                {errors.gender && <p className={styles.error}>{errors.gender}</p>}

                <select
                    className={styles.select}
                    value={studentId}
                    onChange={(e) => {
                        setStudentId(e.target.value)
                        if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: '' }))
                    }}
                >
                    <option value="">학번</option>
                    {Array.from({ length: 20 }, (_, i) => {
                        const year = 10 + i
                        return <option key={year} value={year}>{year}</option>
                    })}
                </select>
                {errors.studentId && <p className={styles.error}>{errors.studentId}</p>}

                <input
                    type="text"
                    className={styles.input}
                    placeholder="닉네임"
                    value={nickname}
                    onChange={(e) => {
                        setNickname(e.target.value)
                        if (errors.nickname) setErrors((prev) => ({ ...prev, nickname: '' }))
                    }}
                />
                {errors.nickname && <p className={styles.error}>{errors.nickname}</p>}

                <button
                    type="button"
                    className={styles.verifyButton}
                    onClick={() => setShowCategoryModal(true)}
                >
                    {preferredCategories.length > 0 
                        ? `카테고리 선택 (${preferredCategories.length}/3)` 
                        : '카테고리 선택 (최대 3개)'}
                </button>
                {preferredCategories.length > 0 && (
                    <div className={styles.selectedTags}>
                        {preferredCategories.map((cat) => (
                            <div key={cat} className={styles.tag}>
                                <span>{cat}</span>
                                <button
                                    type="button"
                                    className={styles.tagRemove}
                                    onClick={() => {
                                        setPreferredCategories(prev => prev.filter(c => c !== cat))
                                    }}
                                    title={`${cat} 제거`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {errors.categories && <p className={styles.error}>{errors.categories}</p>}

                {errors.general && <p className={styles.error}>❗ {errors.general}</p>}

                <button type="submit" className={styles.submitButton}>회원가입 완료</button>
            </form>

            {toast && <div className={styles.toast}>{toast}</div>}

            {showCategoryModal && (
                <CategorySelectModal
                    selected={preferredCategories}
                    setSelected={setPreferredCategories}
                    onClose={() => setShowCategoryModal(false)}
                />
            )}
        </div>
    )
}