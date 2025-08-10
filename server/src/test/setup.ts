import { beforeEach, afterEach, vi } from 'vitest'

const mockPrisma = {
	user: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	board: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	column: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	task: {
		findMany: vi.fn(),
		findUnique: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	$connect: vi.fn(),
	$disconnect: vi.fn(),
	$transaction: vi.fn(),
}

vi.mock('@prisma/client', () => ({
	PrismaClient: vi.fn(() => mockPrisma)
}))

declare global {
	var __TEST_PRISMA__: typeof mockPrisma
}

globalThis.__TEST_PRISMA__ = mockPrisma

beforeEach(() => {
	vi.clearAllMocks()
})

afterEach(() => {
	vi.clearAllMocks()
})

export { mockPrisma }
