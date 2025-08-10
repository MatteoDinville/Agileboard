import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../../components/Modal'

const mockOnClose = vi.fn()

describe('Modal', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders modal with title and children', () => {
		render(
			<Modal
				isOpen={true}
				onClose={mockOnClose}
				title="Test Modal"
			>
				<p>Modal content</p>
			</Modal>
		)

		expect(screen.getByText('Test Modal')).toBeInTheDocument()
		expect(screen.getByText('Modal content')).toBeInTheDocument()
	})

	it('does not render when isOpen is false', () => {
		render(
			<Modal
				isOpen={false}
				onClose={mockOnClose}
				title="Test Modal"
			>
				<p>Modal content</p>
			</Modal>
		)

		expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
		expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
	})

	it('calls onClose when backdrop is clicked', () => {
		render(
			<Modal
				isOpen={true}
				onClose={mockOnClose}
				title="Test Modal"
			>
				<p>Modal content</p>
			</Modal>
		)

		const backdrop = screen.getByTestId('modal-backdrop')
		fireEvent.click(backdrop)

		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})

	it('does not call onClose when modal content is clicked', () => {
		render(
			<Modal
				isOpen={true}
				onClose={mockOnClose}
				title="Test Modal"
			>
				<p>Modal content</p>
			</Modal>
		)

		const modalContent = screen.getByText('Modal content')
		fireEvent.click(modalContent)

		expect(mockOnClose).not.toHaveBeenCalled()
	})

	it('renders with custom className', () => {
		render(
			<Modal
				isOpen={true}
				onClose={mockOnClose}
				title="Test Modal"
				className="custom-class"
			>
				<p>Modal content</p>
			</Modal>
		)

		const modalContent = screen.getByTestId('modal-content')
		expect(modalContent).toHaveClass('custom-class')
	})

	it('renders without title when not provided', () => {
		render(
			<Modal
				isOpen={true}
				onClose={mockOnClose}
			>
				<p>Modal content</p>
			</Modal>
		)

		expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
		expect(screen.getByText('Modal content')).toBeInTheDocument()
	})

	it('renders close button when showCloseButton is true', () => {
		render(
			<Modal
				isOpen={true}
				onClose={mockOnClose}
				title="Test Modal"
				showCloseButton={true}
			>
				<p>Modal content</p>
			</Modal>
		)

		const closeButton = screen.getByRole('button')
		expect(closeButton).toBeInTheDocument()
	})

	it('calls onClose when close button is clicked', () => {
		render(
			<Modal
				isOpen={true}
				onClose={mockOnClose}
				title="Test Modal"
				showCloseButton={true}
			>
				<p>Modal content</p>
			</Modal>
		)

		const closeButton = screen.getByRole('button')
		fireEvent.click(closeButton)

		expect(mockOnClose).toHaveBeenCalledTimes(1)
	})
})
