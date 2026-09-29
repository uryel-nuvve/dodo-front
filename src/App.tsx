import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'offline'>('checking')
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [dbDetails, setDbDetails] = useState<string | null>(null)
  const [backendUrl, setBackendUrl] = useState<string>(() => {
    return localStorage.getItem('backendUrl') || 'http://localhost:3000'
  })

  const checkHealth = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/status`)
      if (response.ok) {
        const data = await response.json()
        setStatus('connected')
        setDbStatus(data.db)
        setDbDetails(data.details)
      } else {
        setStatus('offline')
        setDbStatus('disconnected')
        setDbDetails(null)
      }
    } catch (error) {
      setStatus('offline')
      setDbStatus('disconnected')
      setDbDetails(null)
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 3000)
    return () => clearInterval(interval)
  }, [backendUrl])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setBackendUrl(newUrl)
    localStorage.setItem('backendUrl', newUrl)
    setStatus('checking')
  }

  return (
    <div className="container">
      <div className="panel">

        <div className="input-group">
          <label htmlFor="backendUrl">URL do Backend</label>
          <input 
            id="backendUrl"
            type="text" 
            value={backendUrl} 
            onChange={handleUrlChange}
            placeholder="Ex: http://localhost:3000" 
          />
        </div>

        <div className="status-list">
          <div className="status-item">
            <div className="status-info">
              <h3>API do Backend</h3>
              <p>Serviço principal</p>
            </div>
            <div className={`status-badge badge-${status}`}>
              {status === 'checking' && 'Verificando'}
              {status === 'connected' && 'Online'}
              {status === 'offline' && 'Offline'}
            </div>
          </div>

          <div className="status-item">
            <div className="status-info">
              <h3>Banco de Dados</h3>
              <p>PostgreSQL</p>
            </div>
            <div className={`status-badge badge-${dbStatus}`}>
              {dbStatus === 'checking' && 'Verificando'}
              {dbStatus === 'connected' && 'Conectado'}
              {dbStatus === 'disconnected' && 'Sem Conexão'}
            </div>
          </div>
        </div>

        {dbDetails && (
          <div className="error-details">
            <strong>Erro no banco:</strong> {dbDetails}
          </div>
        )}

      </div>
    </div>
  )
}

export default App
