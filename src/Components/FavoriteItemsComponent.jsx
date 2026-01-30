import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from './Card'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const FavoriteItemsComponent = () => {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)

  // Hirdetések betöltése
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ads?limit=8`)
        const data = await response.json()

        if (response.ok && data.success) {
          setAds(data.ads || [])
        }
      } catch (err) {
        console.error('Hirdetések betöltési hiba:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [])

  return (
    <div className="w-full mx-auto px-4 mt-8 mb-24">
      {/* Cím és navigációs gombok */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          Legújabb hirdetések
        </h2>
        {/* <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
            <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
            <svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div> */}
      </div>

      {/* Card elemek grid elrendezésben */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Betöltés...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Még nincs hirdetés.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {ads.map((ad) => (
              <Card key={ad._id} ad={ad} />
            ))}
          </div>

          {/* További gomb */}
          {/* <div className="flex justify-center mt-8">
            <Link
              to="/"
              className="px-8 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer"
            >
              További hirdetések
            </Link>
          </div> */}
        </>
      )}
    </div>
  )
}

export default FavoriteItemsComponent

