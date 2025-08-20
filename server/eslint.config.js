import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
		},
		rules: {
			"no-undef": "off",
		},
	},
	{
		ignores: [
			"dist/**",
			"node_modules/**",
		],
	}
)
