# 백엔드 API 엔드포인트 명세서

## 1. 카테고리 목록 조회

### GET /api/categories
카테고리 목록을 조회합니다.

**Response:**
```json
{
  "categories": ["운동", "스터디", "모임", "문화", "취미"]
}
```

---

## 2. 이메일 인증

### POST /api/auth/send-verification-email
이메일 인증 메일을 전송합니다.

**Request Body:**
```json
{
  "email": "user@konkuk.ac.kr",
}
```
**Response:**
```json
{
  "success": true,
  "message": "인증 메일이 전송되었습니다.",
  "verificationId": "uuid-string"
}
```

### POST /api/auth/verify-email
이메일 인증을 확인합니다.

**Headers:**
- `Content-Type: application/json`
- `Accept: application/json`
- `Cookie: signup_session=<SESSION_ID>`

**Request Body:**
```json
{}
```
- 바디 없음 → 확인만 수행

**Responses:**

#### 200 OK
```json
{
  "verified": true,
  "email": "user@konkuk.ac.kr"
}
```
- 프론트는 이 응답을 받으면 다음단계로 진행

#### 400 Bad Request
```json
{
  "error": { 
	  "code": "INVALID_SESSION", 
	  "message": "유효한 가입 세션이 없습니다." 
	}
}
```

```json
{
  "error": { 
	  "code": "VERIFICATION_NOT_STARTED", 
	  "message": "인증 메일 발송 기록이 없습니다." 
	}
}
```

```json
{
  "error": { 
	  "code": "EMAIL_MISMATCH", 
	  "message": "세션의 이메일과 인증된 이메일이 일치하지 않습니다." 
	}
}
```

#### 410 Gone
```json
{
  "error": { 
	  "code": "TOKEN_EXPIRED_OR_USED", 
	  "message": "인증 토큰이 만료되었거나 이미 사용되었습니다." 
	}
}
```
- 외부 브라우저 단계에서 사용된 토큰이 만료되었거나 이미 소비되어, 현재 세션에서 확인을 완료할 수가 없음

#### 500 Internal Server Error
```json
{
  "error": { 
	  "code": "INTERNAL_SERVER_ERROR", 
	  "message": "이메일 인증 확인 중 오류가 발생했습니다." 
	}
}
```

---

## 3. 프로필 이미지 업로드 (Presigned URL 방식)

### POST /api/upload/presigned-url
프로필 이미지 업로드를 위한 presigned URL을 생성합니다.

**Request Body:**
```json
{
  "fileName": "profile.jpg",
  "fileType": "image/jpeg",
  "fileSize": 1024000,
  "type": "profile"
}
```

**Response:**
```json
{
  "success": true,
  "uploadURL": "https://s3-bucket.amazonaws.com/profiles/2025/01/uuid-filename.jpg?AWSAccessKeyId=...&Signature=...&Expires=...",
  "key": "profiles/2025/01/uuid-filename.jpg",
  "bucket": "app-user-profile"
}
```

### PUT {uploadURL}
S3에 직접 이미지를 업로드합니다.

**Request:**
- Method: `PUT`
- URL: presigned URL (위 API에서 받은 uploadURL)
- Body: 이미지 파일 (binary)
- Headers:
  - `Content-Type`: 이미지 MIME 타입 (예: `image/jpeg`)

**Response:**
- HTTP 200: 업로드 성공
- HTTP 403: 권한 없음 (presigned URL 만료 또는 잘못된 서명)
- HTTP 413: 파일 크기 초과

---

## 4. 회원가입

### POST /api/signup
사용자 회원가입을 처리합니다.

**Request Body:**
```json
{
  "email": "user@konkuk.ac.kr",
  "password": "hashed-password",
  "profileImage": {
    "bucket": "app-user-profile",
    "key": "profiles/2025/01/uuid-filename.jpg",
    "url": "https://s3-bucket.amazonaws.com/profiles/2025/01/uuid-filename.jpg"
  },
  "age": 20,
  "gender": "MALE",
  "enrollNumber": 23,
  "nickname": "사용자닉네임",
  "preferredCategories": ["운동", "스터디"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": "user-uuid",
    "email": "user@konkuk.ac.kr",
    "nickname": "사용자닉네임"
  }
}
```

---

## 5. 로그인 (기존 구현)

### POST /api/login
사용자 로그인을 처리합니다.

**Request Body:**
```json
{
  "email": "user@konkuk.ac.kr",
  "password": "user-password"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "id": "user-uuid",
    "email": "user@konkuk.ac.kr",
    "nickname": "사용자닉네임"
  }
}
```

---

## 에러 응답 형식

모든 API는 실패 시 다음과 같은 형식으로 응답합니다:

```json
{
  "success": false,
  "error": {
    "message": "에러 메시지",
    "code": "ERROR_CODE",
    "details": "상세 에러 정보"
  }
}
```

## HTTP 상태 코드

- `200`: 성공
- `400`: 잘못된 요청 (유효성 검사 실패 등)
- `401`: 인증 실패
- `409`: 중복 데이터 (이미 존재하는 이메일 등)
- `413`: 파일 크기 초과
- `415`: 지원하지 않는 파일 형식
- `500`: 서버 내부 오류

## 보안 고려사항

1. **비밀번호**: 클라이언트에서 해시화하여 전송
2. **이미지 업로드**: 파일 크기 제한 (5MB), 파일 타입 검증
3. **이메일 인증**: 건국대학교 도메인만 허용
4. **JWT 토큰**: Access Token은 메모리에, Refresh Token은 HttpOnly 쿠키에 저장
