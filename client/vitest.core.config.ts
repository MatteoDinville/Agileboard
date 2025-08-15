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
				'src/utils/hooks/**/*.ts',
				'src/lib/**/*.ts',
				'src/types/**/*.ts',
				'src/services/**/*.ts',
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
				statements: 100,
				branches: 100,
				functions: 100,
				lines: 100,
			},
		}
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src')
		}
	}
})


