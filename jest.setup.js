// DOM 매처/Fetch 폴리필(있으면 로드)
try {
    require("@testing-library/jest-dom");
} catch (e) {}
try {
    require("whatwg-fetch");
} catch (e) {}

// 모듈 존재 여부에 따라 안전하게 mock 하는 헬퍼
const safeMock = (name, factory) => {
    try {
        require.resolve(name); // 모듈이 실제 존재하면
        jest.mock(name, factory); // 일반 mock
    } catch {
        jest.mock(name, factory, { virtual: true }); // 없으면 가상 mock
    }
};

// next/image: <img>로 대체
safeMock("next/image", () => ({
    __esModule: true,
    default: (props) => {
        const React = require("react"); // 팩토리 내부에서 require (스코프 이슈 방지)
        return React.createElement("img", props);
    },
}));

// App Router 라우터 목
safeMock("next/navigation", () => ({
    __esModule: true,
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        prefetch: jest.fn(),
    }),
}));
