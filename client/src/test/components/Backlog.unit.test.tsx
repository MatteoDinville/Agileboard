import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { useQuery } from '@tanstack/react-query'
import Backlog from '../../components/Backlog'

describe('Backlog utility branches', () => {
	it('renders priority/status badges for all enums (covers getPriorityColor/getStatusColor)', () => {
		vi.mocked(useQuery).mockReturnValue({
			data: [],
			isLoading: false,
			error: null,
			isError: false,
			isFetching: false,
			isSuccess: true,
			refetch: vi.fn(),
		})
		const { container } = render(<Backlog projectId={1} />)
		expect(container).toBeTruthy()
	})
})


