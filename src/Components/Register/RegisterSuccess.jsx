import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const RegisterSuccess = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="w-full rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-lg p-8 md:p-12">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        {/* Zöld pipa */}
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Üzenet */}
        <p className="text-lg text-gray-600 mb-8 max-w-2xl">
          Gratulálunk! Sikeresen regisztráltál. Mostmár teljes körűen használhatod a TwoDotHand-et és az összes funkcióhoz hozzáférsz.
        </p>

        {/* Gombok */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="px-8 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer text-center"
            >
              Tovább a profilomra
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-8 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer text-center"
            >
              Bejelentkezés
            </Link>
          )}
          <Link
            to="/"
            className="px-8 py-3 rounded-full bg-blue-200 text-blue-800 font-medium hover:bg-blue-300 transition-colors cursor-pointer text-center"
          >
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterSuccess

