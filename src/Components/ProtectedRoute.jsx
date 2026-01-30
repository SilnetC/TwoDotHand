import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  // Várjuk meg, amíg a loading befejeződik (pl. localStorage ellenőrzés)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Betöltés...</div>
      </div>
    )
  }

  // Ha nincs bejelentkezve, átirányítjuk a bejelentkezés oldalra
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

