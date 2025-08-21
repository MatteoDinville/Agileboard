import { defineConfig } from 'vitest/config'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		css: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: [
				'src/components/**/*.tsx',
				'src/pages/**/*.tsx',
			],
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.config.*',
				'coverage/',
				'dist/',
				'build/',
				'src/main.tsx',
				'src/App.tsx',
				'src/router.tsx',
				'src/contexts/**/*.tsx',
			],
			thresholds: {
				statements: 95,
				branches: 95,
				functions: 95,
				lines: 95,
			},
		}
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src')
		}
	}
})


