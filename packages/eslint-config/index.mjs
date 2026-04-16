import js from "@eslint/js"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

/** @type {import("eslint").Linter.Config[]} */
export default [
    js.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            // TypeScript strict rules
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/consistent-type-imports": "error",

            // Enforce no null/undefined
            "no-undefined": "error",
            "no-restricted-syntax": [
                "error",
                {
                    selector: "Literal[value=null]",
                    message: "null is forbidden. Use a typed empty value instead (empty string, 0, false, or an EMPTY_ constant).",
                },
            ],

            // No comments
            "no-inline-comments": "error",
            "spaced-comment": ["error", "never"],

            // Enforce descriptive names (no single letters except loop counters)
            "id-length": ["error", { min: 2, exceptions: ["i", "j", "k", "_"] }],

            // No console in committed code
            "no-console": "error",

            // Default exports forbidden inside feature/
            "no-restricted-exports": [
                "error",
                { restrictDefaultExports: { direct: false } }
            ],

            // General quality
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "prefer-const": "error",
            "no-var": "error",
        },
    },
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "dist/**",
            "coverage/**",
            "*.config.{js,mjs,ts}",
        ],
    },
]
