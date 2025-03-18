import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
	const [count, setCount] = useState(0)

	return (
		<>
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
				<div className="flex gap-8 mb-8">
					<a href="https://vite.dev" target="_blank" className="hover:scale-110 transition-transform">
						<img src={viteLogo} className="w-24 h-24" alt="Vite logo" />
					</a>
					<a href="https://react.dev" target="_blank" className="hover:scale-110 transition-transform">
						<img src={reactLogo} className="w-24 h-24 animate-spin-slow" alt="React logo" />
					</a>
				</div>
				<h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
					Vite + React
				</h1>
				<div className="bg-white p-6 rounded-lg shadow-lg mb-8">
					<button
						onClick={() => setCount((count) => count + 1)}
						className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors mb-4"
					>
						Count is {count}
					</button>
					<p className="text-gray-600">
						Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
					</p>
				</div>
				<p className="text-gray-500 text-sm">
					Click on the Vite and React logos to learn more
				</p>
			</div>
		</>
	)
}

export default App
