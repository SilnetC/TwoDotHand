import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const RatingModal = ({ onClose, order, token, onRatingSubmitted }) => {
  const { user } = useAuth()
  const [selectedRating, setSelectedRating] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingRating, setExistingRating] = useState(null)

  // Meghatározzuk, hogy kit értékelünk
  // Ha a bejelentkezett felhasználó a vásárló, akkor az eladót értékeljük, és fordítva
  const currentUserId = user?.id
  const buyerId = order?.buyer?._id?.toString() || order?.buyer?.toString()
  const isCurrentUserBuyer = buyerId === currentUserId
  
  const ratedUser = isCurrentUserBuyer ? order?.seller : order?.buyer

  useEffect(() => {
    const fetchExistingRating = async () => {
      if (!order?._id || !token) return

      try {
        const response = await fetch(`${API_BASE_URL}/ratings/order/${order._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success && data.rating) {
          setExistingRating(data.rating)
          setSelectedRating(data.rating.rating)
        }
      } catch (err) {
        console.error('Értékelés lekérési hiba:', err)
      }
    }

    fetchExistingRating()
  }, [order?._id, token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedRating) {
      setError('Kérjük, válassz egy értékelést')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          rating: selectedRating
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (onRatingSubmitted) {
          onRatingSubmitted()
        }
        onClose()
      } else {
        setError(data.message || 'Hiba történt az értékelés mentése során')
      }
    } catch (err) {
      console.error('Értékelés mentési hiba:', err)
      setError('Hálózati hiba történt. Kérjük, próbáld újra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Értékelés
        </h2>

        {/* Értékelni kívánt felhasználó neve */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Értékelni kívánt felhasználó:</p>
          <p className="text-lg font-semibold text-gray-800">
            {ratedUser?.fullName || ratedUser?.name || 'Ismeretlen felhasználó'}
          </p>
        </div>

        {/* Hirdetés címe */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Hirdetés címe:</p>
          <p className="text-lg font-semibold text-gray-800">
            {order?.ad?.title || 'N/A'}
          </p>
        </div>

        {/* Értékelés gombok */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Válassz értékelést:</p>
          <div className="flex gap-4 justify-center">
            {/* Pozitív értékelés */}
            <button
              type="button"
              onClick={() => setSelectedRating('positive')}
              disabled={loading || !!existingRating}
              className={`px-6 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                selectedRating === 'positive'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-green-400'
              } ${loading || existingRating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-sm font-medium text-green-700">Pozitív értékelés</span>
            </button>

            {/* Negatív értékelés */}
            <button
              type="button"
              onClick={() => setSelectedRating('negative')}
              disabled={loading || !!existingRating}
              className={`px-6 py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                selectedRating === 'negative'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-red-400'
              } ${loading || existingRating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium text-red-700">Negatív értékelés</span>
            </button>
          </div>
        </div>

        {existingRating && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Már értékelted ezt a rendelést: <span className="font-semibold">
                {existingRating.rating === 'positive' ? 'Pozitív' : 'Negatív'}
              </span>
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Gombok */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-full bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            Mégse
          </button>
          {!existingRating && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !selectedRating}
              className="flex-1 px-6 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mentés...' : 'Értékelés'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RatingModal

