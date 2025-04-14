import { RouterProvider } from '@tanstack/react-router';
import { router } from './pages/routes';
import { Toaster } from 'react-hot-toast';

function App() {
	return (
		<>
			<RouterProvider router={router} />
			<Toaster
				position="top-center"
				toastOptions={{
					style: {
						background: '#363636',
						color: '#fff',
					},
					success: {
						duration: 3000,
					},
				}}
			/>
		</>
	);
}

export default App;
