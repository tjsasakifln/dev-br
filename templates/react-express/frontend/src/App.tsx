import { useState, useEffect } from 'react'

interface HealthStatus {
  status: string;
}

function App() {
  const [healthStatus, setHealthStatus] = useState<string>('loading...')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await fetch('/api/health')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: HealthStatus = await response.json()
        setHealthStatus(data.status)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health status')
        setHealthStatus('error')
      }
    }

    fetchHealthStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          React + Express App
        </h1>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Backend Health Status
          </h2>
          
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              healthStatus === 'ok' ? 'bg-green-500' : 
              healthStatus === 'error' ? 'bg-red-500' : 
              'bg-yellow-500'
            }`}></div>
            <span className={`font-medium ${
              healthStatus === 'ok' ? 'text-green-600' : 
              healthStatus === 'error' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {healthStatus}
            </span>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Frontend: React + TypeScript + Vite</p>
            <p>Backend: Express.js + TypeScript</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App