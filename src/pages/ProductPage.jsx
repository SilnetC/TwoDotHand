import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import placeholderImage from '../assets/PlaceholderPhotos/Iphone_sell.png'
import { appleColors } from '../utils/appleColors'
import { getCo2Footprint } from '../utils/co2Footprint'
import MaxFavoritesModal from '../Components/Modals/MaxFavoritesModal'
import ReviewCard from '../Components/ReviewCard'
import iPhone from '../assets/HeroImages/iPhone.png'
import iPad from '../assets/HeroImages/iPad.png'
import AirPods from '../assets/HeroImages/AirPods.png'
import AirTag from '../assets/HeroImages/AirTag.png'
import Accessories from '../assets/HeroImages/Accessories.png'
import MacBook from '../assets/HeroImages/MacBook.png'
import iMac from '../assets/HeroImages/iMac.png'
import MacMini from '../assets/HeroImages/MacMini.png'
import Displays from '../assets/HeroImages/Displays.png'
import Others from '../assets/HeroImages/Others.png'
import AppleWatch from '../assets/HeroImages/AppleWatch.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Főkategóriák
const mainCategories = [
  { name: 'iPhone', image: iPhone },
  { name: 'iPad', image: iPad },
  { name: 'AirPods', image: AirPods },
  { name: 'AirTag', image: AirTag },
  { name: 'Kiegészítők', image: Accessories },
  { name: 'Macbook', image: MacBook },
  { name: 'iMac', image: iMac },
  { name: 'Mac Mini', image: MacMini },
  { name: 'Mac Studio', image: MacBook },
  { name: 'Kijelzők', image: Displays },
  { name: 'Egyéb', image: Others },
  { name: 'Apple Watch', image: AppleWatch },
]

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showMaxModal, setShowMaxModal] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [currentReviewPage, setCurrentReviewPage] = useState(0)
  const reviewsPerPage = 3
  const [isOrdered, setIsOrdered] = useState(false)
  const [isSold, setIsSold] = useState(false)
  const [sellerRatings, setSellerRatings] = useState({ positiveCount: 0, negativeCount: 0 })
  const [loadingSellerRatings, setLoadingSellerRatings] = useState(false)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ads/${id}`)
        const data = await response.json()

        if (response.ok && data.success && data.ad) {
          setAd(data.ad)
          // Elsődleges kép indexének megtalálása
          if (data.ad.images && data.ad.images.length > 0) {
            const primaryIndex = data.ad.images.findIndex(img => img.isPrimary)
            if (primaryIndex >= 0) {
              setCurrentImageIndex(primaryIndex)
            } else {
              setCurrentImageIndex(0)
            }
          }
        } else {
          setError(data.message || 'Hirdetés nem található')
        }
      } catch (err) {
        console.error('Hirdetés betöltési hiba:', err)
        setError('Hiba történt a hirdetés betöltése során')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAd()
    }

    // Ellenőrizzük, hogy a hirdetés meg van-e rendelve
    const checkIfOrdered = async () => {
      if (!id) return
      
      try {
        const response = await fetch(`${API_BASE_URL}/orders/check-ad/${id}`)
        const data = await response.json()
        
        if (response.ok && data.success) {
          setIsOrdered(data.isOrdered)
          setIsSold(data.isSold || false)
        }
      } catch (error) {
        console.error('Hirdetés rendelési státusz ellenőrzési hiba:', error)
      }
    }
    
    if (id) {
      checkIfOrdered()
    }
  }, [id])

  // Mentett státusz ellenőrzése
  useEffect(() => {
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

  // Vélemények betöltése
  useEffect(() => {
    if (ad?.category && ad?.subCategory) {
      const fetchReviews = async () => {
        setLoadingReviews(true)
        try {
          const response = await fetch(`${API_BASE_URL}/reviews/category/${encodeURIComponent(ad.category)}/${encodeURIComponent(ad.subCategory)}`)
          const data = await response.json()
          
          if (response.ok && data.success) {
            setReviews(data.reviews || [])
          }
        } catch (error) {
          console.error('Vélemények betöltési hiba:', error)
        } finally {
          setLoadingReviews(false)
        }
      }
      
      fetchReviews()
    }
  }, [ad?.category, ad?.subCategory])

  // Hirdető értékeléseinek betöltése
  useEffect(() => {
    const fetchSellerRatings = async () => {
      // Ellenőrizzük, hogy van-e seller információ
      if (!ad?.seller) {
        console.log('Nincs seller információ az ad-ban:', ad)
        return
      }

      // Seller ID kinyerése (lehet objektum vagy string vagy ObjectId)
      let sellerId = null
      if (typeof ad.seller === 'object' && ad.seller !== null) {
        // Ha objektum, lehet _id vagy id mező
        sellerId = ad.seller._id?.toString() || ad.seller.id?.toString() || ad.seller.toString()
      } else if (typeof ad.seller === 'string') {
        sellerId = ad.seller
      }

      if (!sellerId) {
        console.warn('Nincs seller ID', { seller: ad.seller })
        return
      }

      console.log('Seller ID:', sellerId) // Debug log
      setLoadingSellerRatings(true)
      try {
        const response = await fetch(`${API_BASE_URL}/ratings/user/${sellerId}`)
        const data = await response.json()

        console.log('Értékelések válasz:', data) // Debug log

        if (response.ok && data.success) {
          setSellerRatings({
            positiveCount: data.positiveCount || 0,
            negativeCount: data.negativeCount || 0
          })
        } else {
          console.error('Értékelések betöltési hiba:', data.message)
        }
      } catch (err) {
        console.error('Hirdető értékeléseinek betöltési hiba:', err)
      } finally {
        setLoadingSellerRatings(false)
      }
    }

    if (ad) {
      fetchSellerRatings()
    }
  }, [ad])

  const handlePreviousReviews = () => {
    setCurrentReviewPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextReviews = () => {
    const maxPage = Math.ceil(reviews.length / reviewsPerPage) - 1
    setCurrentReviewPage((prev) => Math.min(maxPage, prev + 1))
  }

  const displayedReviews = reviews.slice(
    currentReviewPage * reviewsPerPage,
    (currentReviewPage + 1) * reviewsPerPage
  )

  const handlePreviousImage = () => {
    if (ad?.images && ad.images.length > 0) {
      setCurrentImageIndex(prev => (prev === 0 ? ad.images.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (ad?.images && ad.images.length > 0) {
      setCurrentImageIndex(prev => (prev === ad.images.length - 1 ? 0 : prev + 1))
    }
  }

  const categoryData = ad?.category ? mainCategories.find(cat => cat.name === ad.category) : null
  const currentImage = ad?.images?.[currentImageIndex] || ad?.images?.[0]
  const imageUrl = currentImage?.url || placeholderImage
  const formattedPrice = ad?.price ? `${parseInt(ad.price).toLocaleString('hu-HU')} Ft` : 'Ár érdeklődésre'
  
  // Akkumulátor százalék kinyerése
  const batteryPercentage = ad?.battery ? parseInt(ad.battery.toString().replace(/%/g, '').trim()) : null
  const showBatteryWarning = batteryPercentage !== null && !isNaN(batteryPercentage) && batteryPercentage < 80
  
  // CO2 lábnyom értékének meghatározása kategória alapján
  const co2Value = getCo2Footprint(ad?.category)

  const handleSaveClick = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
          <Navbar />
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-600">Betöltés...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
          <Navbar />
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-red-600">{error || 'Hirdetés nem található'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Navbar />
        <div className="px-4 py-8">
          {/* Fő négyzet - világosszürke, lekerekített, kiér a container széléig */}
          <div className="rounded-xl bg-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Bal oldal - 40% (2 oszlop 5-ből) */}
              <div className="lg:col-span-2">
                {/* Kép nézet */}
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white">
                  <img
                    src={imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Bal oldali nyíl */}
                  {ad.images && ad.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center shadow-lg"
                        aria-label="Előző kép"
                      >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {/* Jobb oldali nyíl */}
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center shadow-lg"
                        aria-label="Következő kép"
                      >
                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Kép számláló */}
                  {ad.images && ad.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                      {currentImageIndex + 1} / {ad.images.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Jobb oldal - 60% (3 oszlop 5-ből) */}
              <div className="lg:col-span-3 flex flex-col">
                {/* Cím és akció gombok */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-black">
                        {ad.title}
                      </h1>
                      {isOrdered && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isSold 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isSold ? 'Eladva' : 'Megrendelve'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Mentés gomb */}
                    <button 
                      onClick={handleSaveClick}
                      disabled={isFavorite || !isAuthenticated}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isFavorite || !isAuthenticated
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-200 hover:bg-indigo-300 cursor-pointer'
                      }`}
                    >
                      <svg className={`w-5 h-5 ${isFavorite || !isAuthenticated ? 'text-gray-500' : 'text-gray-700'}`} fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    {/* Megosztás gomb */}
                    <button className="w-10 h-10 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Kategória és helyszín */}
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  {/* Kategória */}
                  {categoryData && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-100">
                      <img src={categoryData.image} alt={categoryData.name} className="w-6 h-6 object-contain" />
                      <span className="text-gray-700 font-medium">{ad.category}</span>
                      {ad.subCategory && (
                        <span className="text-gray-600">- {ad.subCategory}</span>
                      )}
                    </div>
                  )}
                  
                  {/* Helyszín */}
                  {ad.location && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-gray-700 font-medium">{ad.location}</span>
                    </div>
                  )}
                </div>

                {/* Részletek */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-blue-800 mb-3">Részletek</h2>
                  <div className="flex flex-wrap gap-2">
                    {/* Apple garancia - csak ha van garancia információ */}
                    {ad.warrantyStatus && (
                      <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                        ad.warrantyStatus === 'Érvényes'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Apple garancia: {ad.warrantyStatus === 'Érvényes' ? 'Aktív' : 'Lejárt'}
                        {ad.warrantyStatus === 'Érvényes' && ad.warrantyExpiryDate && (
                          <span className="ml-2">
                            (Lejárat: {new Date(ad.warrantyExpiryDate).toLocaleDateString('hu-HU', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            })})
                          </span>
                        )}
                      </span>
                    )}
                    
                    {/* Szín */}
                    {ad.color && (() => {
                      const colorHex = appleColors[ad.color.toLowerCase()]
                      return (
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
                      )
                    })()}
                    
                    {/* CO2 - csak ha van érték */}
                    {co2Value !== null && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 font-medium">{co2Value} KG CO2</span>
                      </div>
                    )}
                    
                    {/* Állapot */}
                    {ad.condition && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-700 font-medium">{ad.condition}</span>
                      </div>
                    )}
                    
                    {/* Tárhely */}
                    {ad.storage && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        <span className="text-sm text-gray-700 font-medium">{ad.storage}</span>
                      </div>
                    )}
                    
                    {/* Akkumulátor */}
                    {ad.battery && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 font-medium">{ad.battery}</span>
                      </div>
                    )}
                    
                    {/* Akkumulátor figyelmeztetés */}
                    {showBatteryWarning && (
                      <span className="inline-block px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                        Akkumulátor csere ajánlott
                      </span>
                    )}
                  </div>
                </div>

                {/* Ár és vásárlás gomb */}
                <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-300">
                  <div className="text-3xl font-bold text-gray-800">
                    {formattedPrice}
                  </div>
                  {isOrdered ? (
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full font-medium ${
                        isSold 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isSold ? 'Eladva' : 'Megrendelve'}
                      </span>
                      <button
                        disabled
                        className="px-8 py-3 rounded-full bg-gray-300 text-gray-500 font-medium cursor-not-allowed"
                      >
                        Vásárlás
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate(`/order/${id}`)}
                      className="px-8 py-3 rounded-full bg-blue-200 text-blue-800 font-medium hover:bg-blue-300 transition-colors cursor-pointer"
                    >
                      Vásárlás
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Leírás négyzet - világoskék */}
          <div className="rounded-xl bg-blue-100 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bal oldal - leírás (2 oszlop) */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-black mb-4">Leírás</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{ad.description || 'Nincs leírás megadva.'}</p>
              </div>

              {/* Jobb oldal - hirdető info (1 oszlop) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-4 mb-4">
                  <div className="mb-4">
                    <p className="text-gray-700 font-medium">Hirdető:</p>
                    <p className="text-gray-900 font-semibold text-lg">{ad.seller?.fullName || 'Névtelen'}</p>
                  </div>
                  
                  {/* Értékelések */}
                  {loadingSellerRatings ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Betöltés...</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="text-sm font-semibold">{sellerRatings.positiveCount}</span>
                        <span className="text-xs text-gray-600">pozitív</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="text-sm font-semibold">{sellerRatings.negativeCount}</span>
                        <span className="text-xs text-gray-600">negatív</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Üzenet gomb */}
                <button className="w-full px-6 py-3 rounded-full bg-cyan-200 text-cyan-800 font-medium hover:bg-cyan-300 transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Üzenet a hirdetőnek
                </button>
              </div>
            </div>
          </div>

          {/* Vélemények szekció */}
          {ad && (
            <div className="mt-12 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Vélemények</h2>
              
              {loadingReviews ? (
                <p className="text-gray-600">Vélemények betöltése...</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-600">Még nincsenek vélemények erről a terméktípusról.</p>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayedReviews.map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                  </div>
                  
                  {/* Lapozó gombok */}
                  {reviews.length > reviewsPerPage && (
                    <div className="flex items-center justify-between mt-6">
                      <button
                        onClick={handlePreviousReviews}
                        disabled={currentReviewPage === 0}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
                          currentReviewPage === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Előző
                      </button>
                      
                      <span className="text-gray-600 text-sm">
                        {currentReviewPage + 1} / {Math.ceil(reviews.length / reviewsPerPage)}
                      </span>
                      
                      <button
                        onClick={handleNextReviews}
                        disabled={currentReviewPage >= Math.ceil(reviews.length / reviewsPerPage) - 1}
                        className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
                          currentReviewPage >= Math.ceil(reviews.length / reviewsPerPage) - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                        }`}
                      >
                        Következő
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <Footer />
      </div>
      
      {/* Maximum elérése modal */}
      {showMaxModal && <MaxFavoritesModal onClose={() => setShowMaxModal(false)} />}
    </div>
  )
}

export default ProductPage
