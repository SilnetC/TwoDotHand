import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import placeholderImage from '../assets/PlaceholderPhotos/Iphone_sell.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const OrderPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token, isAuthenticated } = useAuth()
  
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '')
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '')
  const [shippingMethod, setShippingMethod] = useState('')
  const [selectedShippingPoint, setSelectedShippingPoint] = useState(null)
  const [showFoxpostIframe, setShowFoxpostIframe] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchAd = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ads/${id}`)
        const data = await response.json()

        if (response.ok && data.success && data.ad) {
          setAd(data.ad)
          
          // Ha a saját hirdetése, visszairányítjuk
          if (data.ad.seller?._id?.toString() === user?.id) {
            alert('Nem vásárolhatod meg a saját hirdetésedet')
            navigate(`/product/${id}`)
            return
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
  }, [id, isAuthenticated, navigate, user])

  // Foxpost iframe üzenet kezelése
  useEffect(() => {
    const receiveMessage = (event) => {
      // Biztonsági ellenőrzés - csak Foxpost domain-ről
      if (event.origin !== 'https://cdn.foxpost.hu' && event.origin !== 'http://localhost:5173') {
        return
      }

      try {
        // Az event.data lehet string vagy objektum
        let apt
        if (typeof event.data === 'string') {
          try {
            apt = JSON.parse(event.data)
          } catch (parseErr) {
            // Ha nem sikerül parse-olni, akkor nem Foxpost adat
            return
          }
        } else if (typeof event.data === 'object' && event.data !== null) {
          apt = event.data
        } else {
          return
        }

        // Ellenőrizzük, hogy Foxpost adatokról van-e szó
        if (apt && apt.name && apt.address) {
          console.log('Foxpost csomagpont kiválasztva:', apt)
          setSelectedShippingPoint({
            name: apt.name,
            address: apt.address
          })
          setShowFoxpostIframe(false)
        }
      } catch (err) {
        console.error('Hiba a Foxpost adatok feldolgozásakor:', err)
        console.log('Event data type:', typeof event.data)
        console.log('Event data:', event.data)
      }
    }

    window.addEventListener('message', receiveMessage, false)
    return () => {
      window.removeEventListener('message', receiveMessage, false)
    }
  }, [])

  const handleShippingMethodChange = (method) => {
    setShippingMethod(method)
    setSelectedShippingPoint(null)
    
    if (method === 'Foxpost') {
      setShowFoxpostIframe(true)
    } else {
      setShowFoxpostIframe(false)
    }
  }

  const getExpectedDeliveryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date
  }

  const formatDate = (date) => {
    const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']
    const months = ['január', 'február', 'március', 'április', 'május', 'június', 
                   'július', 'augusztus', 'szeptember', 'október', 'november', 'december']
    
    const dayName = days[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    
    return `${dayName}, ${day}. ${month}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!buyerEmail.trim()) {
      setError('Az email cím megadása kötelező')
      return
    }

    if (!buyerPhone.trim()) {
      setError('A telefonszám megadása kötelező')
      return
    }

    if (!shippingMethod) {
      setError('Kérjük, válassz szállítási módot')
      return
    }

    if (shippingMethod === 'Foxpost' && !selectedShippingPoint) {
      setError('Kérjük, válassz Foxpost csomagpontot')
      return
    }

    const authToken = token || localStorage.getItem('token')
    if (!authToken) {
      navigate('/login')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          adId: id,
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
          shippingMethod,
          shippingPointName: selectedShippingPoint?.name || '',
          shippingPointAddress: selectedShippingPoint?.address || ''
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Rendelés sikeresen leadva!')
        navigate('/profile?tab=orders')
      } else {
        setError(data.message || 'Hiba történt a rendelés leadása során')
      }
    } catch (err) {
      console.error('Rendelés leadási hiba:', err)
      setError('Hálózati hiba történt. Kérjük, próbáld újra.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Betöltés...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error && !ad) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-red-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 mx-auto block px-6 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer"
          >
            Vissza a főoldalra
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  if (!ad) return null

  const productPrice = parseInt(ad.price) || 0
  const shippingCost = 1499
  const totalPrice = productPrice + shippingCost
  const expectedDate = getExpectedDeliveryDate()
  const primaryImage = ad.images?.find(img => img.isPrimary) || ad.images?.[0]
  const imageUrl = primaryImage?.url || placeholderImage

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Rendelés leadása
        </h1>

        {/* Termék kártya */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-6 flex gap-4">
          <img
            src={imageUrl}
            alt={ad.title}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {ad.title}
            </h3>
            <p className="text-xl font-bold text-gray-900">
              {productPrice.toLocaleString('hu-HU')} Ft
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Vásárló adatai */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Vásárló adatai</h2>
            
            <div className="space-y-4">
              {/* Teljes név */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teljes név
                </label>
                <input
                  type="text"
                  value={user?.fullName || user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email cím
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Telefonszám */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefonszám
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Szállítási információk */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Szállítási információk
            </h2>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <button
                type="button"
                onClick={() => handleShippingMethodChange('Foxpost')}
                className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                  shippingMethod === 'Foxpost'
                    ? 'border-blue-800 bg-blue-100 text-blue-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              >
                Foxpost csomagpont
              </button>
              
              <button
                type="button"
                onClick={() => handleShippingMethodChange('GLS')}
                className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                  shippingMethod === 'GLS'
                    ? 'border-blue-800 bg-blue-100 text-blue-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              >
                GLS csomagpont
              </button>
              
              <button
                type="button"
                onClick={() => handleShippingMethodChange('Posta')}
                className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                  shippingMethod === 'Posta'
                    ? 'border-blue-800 bg-blue-100 text-blue-800'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              >
                Posta csomagpont
              </button>
            </div>

            {/* Foxpost iframe */}
            {showFoxpostIframe && (
              <div className="mt-4">
                <iframe
                  frameBorder="0"
                  loading="lazy"
                  src="https://cdn.foxpost.hu/apt-finder/v1/app/?discount=1&desktop_height=450&tablet_width=600&tablet_height=350&mobile_width=400&mobile_height=350"
                  width="100%"
                  height="450"
                  className="rounded-lg"
                />
              </div>
            )}

            {/* Kiválasztott csomagpont */}
            {selectedShippingPoint && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">
                  Kiválasztott csomagpont:
                </p>
                <p className="text-green-900 font-semibold">{selectedShippingPoint.name}</p>
                <p className="text-green-700 text-sm">{selectedShippingPoint.address}</p>
              </div>
            )}
          </div>

          {/* Összegzés */}
          <div className="bg-gray-100 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Összegzés</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Kategória és ár */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Kategória</p>
                <p className="font-semibold text-gray-800">{ad.category}</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {productPrice.toLocaleString('hu-HU')} Ft
                </p>
              </div>

              {/* Szállítás */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Szállítás</p>
                <p className="text-lg font-bold text-gray-900">
                  {shippingCost.toLocaleString('hu-HU')} Ft
                </p>
              </div>

              {/* Fizetendő */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Fizetendő</p>
                <p className="text-2xl font-bold text-blue-800">
                  {totalPrice.toLocaleString('hu-HU')} Ft
                </p>
              </div>

              {/* Várható érkezés */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Várható érkezés</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(expectedDate)}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Gombok */}
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate(`/product/${id}`)}
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Rendelés leadása...' : 'Megrendelés'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}

export default OrderPage

