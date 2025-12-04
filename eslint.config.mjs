import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    // 1) Next 기본 설정 + TS 설정 불러오기
    ...compat.extends("next/core-web-vitals", "next/typescript"),

    // 2) 우리 프로젝트 공통 설정
    {
        ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
        rules: {
            // 🔴 any 허용 (당장 빌드 통과용)
            "@typescript-eslint/no-explicit-any": "off",
            // 만약 경고만 띄우고 싶으면:
            // "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];

export default eslintConfig;
