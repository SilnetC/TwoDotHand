import { useNavigate } from 'react-router-dom'

const SuccessModal = ({ onClose, message, description }) => {
  const navigate = useNavigate()

  const handleGoToProfile = () => {
    onClose()
    navigate('/profile')
  }

  const handleGoToHome = () => {
    onClose()
    navigate('/')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Zöld pipa */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Üzenet */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          {message || 'Sikeres hirdetés létrehozás!'}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          {description || 'Hirdetésed sikeresen fel lett adva. Most már megjelenik az oldalon és más felhasználók is megtalálhatják.'}
        </p>

        {/* Gombok */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoToProfile}
            className="px-6 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer"
          >
            Hirdetéseim megtekintése
          </button>
          <button
            onClick={handleGoToHome}
            className="px-6 py-3 rounded-full bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors cursor-pointer"
          >
            Vissza a főoldalra
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal

