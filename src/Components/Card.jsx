import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import placeholderImage from '../assets/PlaceholderPhotos/Iphone_sell.png'
import { appleColors } from '../utils/appleColors'
import { getCo2Footprint } from '../utils/co2Footprint'
import MaxFavoritesModal from './Modals/MaxFavoritesModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const Card = ({ ad, showDeleteButton = false, onDeleteFavorite }) => {
  const { isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [showMaxModal, setShowMaxModal] = useState(false)
  const [isOrdered, setIsOrdered] = useState(false)
  const [isSold, setIsSold] = useState(false)

  useEffect(() => {
    // Ellenőrizzük, hogy mentett-e a hirdetés (ha be van jelentkezve)
    if (isAuthenticated && ad?._id && token) {
      const checkFavoriteStatus = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/favorites/check/${ad._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          const data = await response.json()
          if (data.success) {
            setIsFavorite(data.isFavorite)
          }
        } catch (error) {
          console.error('Hiba a mentett státusz ellenőrzésekor:', error)
        }
      }
      checkFavoriteStatus()
    }
  }, [isAuthenticated, ad?._id, token])

  // Ellenőrizzük, hogy a hirdetés meg van-e rendelve
  useEffect(() => {
    const checkIfOrdered = async () => {
      if (!ad?._id) return
      
      try {
        const response = await fetch(`${API_BASE_URL}/orders/check-ad/${ad._id}`)
        const data = await response.json()
        
        if (response.ok && data.success) {
          setIsOrdered(data.isOrdered)
          setIsSold(data.isSold || false)
        }
      } catch (error) {
        console.error('Hirdetés rendelési státusz ellenőrzési hiba:', error)
      }
    }
    
    checkIfOrdered()
  }, [ad?._id])

  if (!ad) return null

  // Elsődleges kép megtalálása
  const primaryImage = ad.images?.find(img => img.isPrimary) || ad.images?.[0]
  const imageUrl = primaryImage?.url || placeholderImage

  // Ár formázása
  const formattedPrice = ad.price ? `${parseInt(ad.price).toLocaleString('hu-HU')} Ft` : 'Ár érdeklődésre'
  
  // Szín hex kódjának megtalálása
  const colorHex = ad.color ? appleColors[ad.color.toLowerCase()] : null
  
  // CO2 lábnyom értékének meghatározása kategória alapján
  const co2Value = getCo2Footprint(ad.category)

  const handleSaveClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!ad || !ad._id) {
      console.error('Hirdetés ID hiányzik:', ad)
      alert('Hiba: Hirdetés ID nem található')
      return
    }

    const authToken = token || localStorage.getItem('token')
    if (!authToken) {
      navigate('/login')
      return
    }

    try {
      // Biztosítjuk, hogy az ID string formátumú legyen
      const adIdString = ad._id ? String(ad._id) : null
      
      if (!adIdString) {
        console.error('Érvénytelen ad ID:', ad._id)
        alert('Hiba: Érvénytelen hirdetés ID')
        return
      }

      const requestBody = { adId: adIdString }
      console.log('Mentés kérés:', { adId: adIdString, originalId: ad._id, API_BASE_URL: `${API_BASE_URL}/favorites`, fullAd: ad })

      const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      console.log('Mentés válasz:', { status: response.status, data })

      if (response.ok && data.success) {
        setIsFavorite(true)
      } else {
        // Ha elérte a maximumot
        if (data.message && data.message.includes('maximum')) {
          setShowMaxModal(true)
        } else {
          // Egyéb hibák esetén
          console.error('Mentés hiba:', data.message)
          alert(data.message || 'Hiba történt a hirdetés mentése során')
        }
      }
    } catch (error) {
      console.error('Hiba a hirdetés mentésekor:', error)
      alert('Hálózati hiba történt. Kérjük, próbálja újra.')
    }
  }

  return (
    <>
      <div className="rounded-xl bg-gray-200 shadow-lg overflow-hidden flex flex-col p-3 h-full hover:shadow-xl transition-shadow cursor-pointer relative">
        {/* Akció gombok - abszolút pozícióban, Link-en kívül */}
        <div className="absolute top-5 right-5 z-20 flex gap-2">
          {/* Megosztás gomb */}
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
              {/* Törlés gomb (ha showDeleteButton true) vagy Mentés gomb */}
              {showDeleteButton && onDeleteFavorite ? (
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (window.confirm('Biztosan el szeretnéd távolítani ezt a hirdetést a mentettek közül?')) {
                      onDeleteFavorite(ad._id)
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Törlés a mentettek közül"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={handleSaveClick}
                  disabled={isFavorite || !isAuthenticated}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isFavorite || !isAuthenticated
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-200 hover:bg-indigo-300 cursor-pointer'
                  }`}
                >
                  <svg className={`w-4 h-4 ${isFavorite || !isAuthenticated ? 'text-gray-500' : 'text-gray-700'}`} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              )}
        </div>

        <Link to={`/product/${ad._id}`} className="flex-1 flex flex-col">
          {/* Kép */}
          <div className="w-full">
            <img
              src={imageUrl}
              alt={ad.title}
              className="w-full h-48 object-cover rounded-xl"
            />
          </div>

          {/* Tartalom */}
          <div className="pt-4 flex-1 flex flex-col">
            {/* Cím */}
            <div className="mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-black flex-1 line-clamp-2">
                  {ad.title}
                </h2>
                {isOrdered && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    isSold 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isSold ? 'Eladva' : 'Megrendelve'}
                  </span>
                )}
              </div>
            </div>

        {/* Apple garancia pill - csak ha van garancia információ */}
        {ad.warrantyStatus && (
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              ad.warrantyStatus === 'Érvényes'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              Apple garancia: {ad.warrantyStatus === 'Érvényes' ? 'Aktív' : 'Lejárt'}
            </span>
          </div>
        )}

        {/* Kapszulák */}
        <div className="flex flex-wrap gap-2 mb-4">

          {/* CO2 - Károsanyag - csak ha van érték */}
          {co2Value !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700 font-medium">{co2Value} KG CO2</span>
            </div>
          )}

          {/* Tárhely - csak ha van */}
          {ad.storage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="text-sm text-gray-700 font-medium">{ad.storage}</span>
            </div>
          )}

          {/* Akkumulátor - csak ha van */}
          {ad.battery && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700 font-medium">{ad.battery}%</span>
            </div>
          )}

          {/* Állapot - csak ha van */}
          {ad.condition && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-700 font-medium">{ad.condition}</span>
            </div>
          )}

          {/* Szín - csak ha van */}
          {ad.color && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
              {colorHex ? (
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: `#${colorHex}` }}
                />
              ) : (
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              )}
              <span className="text-sm text-gray-700 font-medium">
                {ad.color.charAt(0).toUpperCase() + ad.color.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Ár */}
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-gray-600">{formattedPrice}</p>
        </div>

        {/* Gomb */}
        <div className="w-full py-1.5 rounded-full bg-blue-200 text-blue-800 font-medium hover:bg-blue-300 transition-colors cursor-pointer text-center">
          Hirdetés megtekintése
        </div>
        </div>
        </Link>
    </div>
      
      {/* Maximum elérése modal */}
      {showMaxModal && <MaxFavoritesModal onClose={() => setShowMaxModal(false)} />}
    </>
  )
}

export default Card
