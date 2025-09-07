// jest.setup.js
try {
    require("@testing-library/jest-dom");
} catch (e) {}
try {
    require("whatwg-fetch");
} catch (e) {}

// next/image를 안전하게 모킹 (팩토리 내부 require)
jest.mock("next/image", () => {
    return {
        __esModule: true,
        default: (props) => {
            const React = require("react");
            return React.createElement("img", props);
        },
    };
});

// App Router 간단 모킹
jest.mock("next/navigation", () => {
    return {
        __esModule: true,
        useRouter: () => ({
            push: jest.fn(),
            replace: jest.fn(),
            back: jest.fn(),
            prefetch: jest.fn(),
        }),
    };
});
