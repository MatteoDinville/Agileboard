import { describe, it, expect } from 'vitest'
import { cn } from '../../lib/utils'

describe('cn utility function', () => {
	it('should merge class names correctly', () => {
		const result = cn('text-red-500', 'bg-blue-500', 'p-4')
		expect(result).toBe('text-red-500 bg-blue-500 p-4')
	})

	it('should handle conditional classes', () => {
		const isActive = true
		const result = cn(
			'base-class',
			isActive && 'active-class',
			!isActive && 'inactive-class'
		)
		expect(result).toBe('base-class active-class')
	})

	it('should handle empty strings and falsy values', () => {
		const result = cn('base-class', '', null, undefined, false && 'hidden')
		expect(result).toBe('base-class')
	})

	it('should handle arrays of classes', () => {
		const result = cn(['class1', 'class2'], 'class3', ['class4', 'class5'])
		expect(result).toBe('class1 class2 class3 class4 class5')
	})

	it('should handle objects with boolean values', () => {
		const result = cn({
			'text-red-500': true,
			'bg-blue-500': false,
			'p-4': true
		})
		expect(result).toBe('text-red-500 p-4')
	})

	it('should handle mixed input types', () => {
		const isActive = true
		const result = cn(
			'base-class',
			['array-class1', 'array-class2'],
			{
				'object-class': isActive,
				'hidden': !isActive
			},
			isActive && 'conditional-class'
		)
		expect(result).toBe('base-class array-class1 array-class2 object-class conditional-class')
	})
})
