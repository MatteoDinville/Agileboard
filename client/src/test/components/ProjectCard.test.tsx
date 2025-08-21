import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '../../components/ProjectCard'

describe('ProjectCard', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders project information correctly', () => {
		render(
			<ProjectCard
				name="Test Project"
				description="Test Description"
				keyCode="TEST"
			/>
		)

		expect(screen.getByText('Test Project')).toBeInTheDocument()
		expect(screen.getByText('Test Description')).toBeInTheDocument()
		expect(screen.getByText('TEST')).toBeInTheDocument()
	})

	it('displays project name as heading', () => {
		render(
			<ProjectCard
				name="My Project"
				description="Description"
				keyCode="PROJ"
			/>
		)

		const heading = screen.getByRole('heading', { level: 2 })
		expect(heading).toHaveTextContent('My Project')
	})

	it('displays key code in styled span', () => {
		render(
			<ProjectCard
				name="Test Project"
				description="Description"
				keyCode="ABC123"
			/>
		)

		const keyCodeElement = screen.getByText('ABC123')
		expect(keyCodeElement).toBeInTheDocument()
		expect(keyCodeElement).toHaveClass('bg-blue-500')
	})

	it('handles long descriptions with overflow', () => {
		const longDescription = 'This is a very long description that should be truncated and not overflow the container. It should be properly handled by the CSS overflow hidden property.'

		render(
			<ProjectCard
				name="Test Project"
				description={longDescription}
				keyCode="TEST"
			/>
		)

		const descriptionElement = screen.getByText(longDescription)
		expect(descriptionElement).toBeInTheDocument()
		expect(descriptionElement).toHaveClass('h-20')
	})

	it('handles empty description', () => {
		render(
			<ProjectCard
				name="Test Project"
				description=""
				keyCode="TEST"
			/>
		)

		expect(screen.getByText('Test Project')).toBeInTheDocument()
		expect(screen.getByText('TEST')).toBeInTheDocument()
	})
})
