// DOM 매처
try {
    require("@testing-library/jest-dom");
} catch (e) {}

// fetch 폴리필(필요할 때만)
try {
    require("whatwg-fetch");
} catch (e) {}

// Next.js 환경에서 흔한 크래시 예방 (필요시)
try {
    const React = require("react");
    // next/image를 단순 <img>로
    jest.mock("next/image", () => (props) => React.createElement("img", props));
    // App Router 사용 시 라우터 목
    jest.mock("next/navigation", () => ({
        useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    }));
} catch (e) {}
