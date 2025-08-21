import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
				ecmaVersion: 2022,
				sourceType: 'module',
			},
		},
		files: ['src/**/*.ts', 'prisma/**/*.ts'],
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'*.js',
			'*.mjs',
			'coverage/**',
			'prisma/migrations/**',
			'prisma/seed.ts',
		],
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-inferrable-types': 'off',

			'no-console': 'off',
			'no-unused-vars': 'off',
			'prefer-const': 'error',
			'no-var': 'error',
			'semi': ['error', 'always'],
			'quotes': ['error', 'double', { allowTemplateLiterals: true }],
			'indent': ['error', 'tab'],
			'comma-dangle': ['error', 'never'],
			'object-curly-spacing': ['error', 'always'],
			'array-bracket-spacing': ['error', 'never'],
			'no-trailing-spaces': 'error',
			'eol-last': 'error',

			'no-process-exit': 'off',
			'no-process-env': 'off',

			'consistent-return': 'off',
		},
	},
	{
		files: ['src/test/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'no-console': 'off',
		},
	}
);
