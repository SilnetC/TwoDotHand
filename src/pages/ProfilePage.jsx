import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../Components/Navbar'
import ProtectedRoute from '../Components/ProtectedRoute'
import AdCard from '../Components/AdCard'
import Card from '../Components/Card'
import Footer from '../Components/Footer'
import UpdatePhoneModal from '../Components/Modals/UpdatePhoneModal'
import UpdatePasswordModal from '../Components/Modals/UpdatePasswordModal'
import ReviewCard from '../Components/ReviewCard'
import CreateReviewModal from '../Components/Modals/CreateReviewModal'
import RatingModal from '../Components/Modals/RatingModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const ProfilePageContent = () => {
  const { user, logout, token, login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam || 'my-ads' // 'my-ads', 'favorites', 'info', 'reviews', 'orders', 'sales', 'watches'
  
  const [ads, setAds] = useState([])
  const [favoriteAds, setFavoriteAds] = useState([])
  const [userInfo, setUserInfo] = useState(null)
  const [reviews, setReviews] = useState([])
  const [orders, setOrders] = useState([])
  const [sales, setSales] = useState([])
  const [savedSearches, setSavedSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [loadingUserInfo, setLoadingUserInfo] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingSales, setLoadingSales] = useState(true)
  const [loadingSavedSearches, setLoadingSavedSearches] = useState(true)
  const [error, setError] = useState('')
  const [favoritesError, setFavoritesError] = useState('')
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showCreateReviewModal, setShowCreateReviewModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [pendingSalesCount, setPendingSalesCount] = useState(0)
  const [inTransitOrdersCount, setInTransitOrdersCount] = useState(0)
  const [savedSearchesNotificationsCount, setSavedSearchesNotificationsCount] = useState(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null)
  const [userRatings, setUserRatings] = useState({ positiveCount: 0, negativeCount: 0 })
  const [loadingRatings, setLoadingRatings] = useState(false)
  const [selectedSavedSearch, setSelectedSavedSearch] = useState(null)
  const [newAdsForSearch, setNewAdsForSearch] = useState([])
  const [loadingNewAds, setLoadingNewAds] = useState(false)

  // Hirdetések betöltése
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) {
          setError('Nincs bejelentkezve')
          setLoading(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/ads/my-ads`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setAds(data.ads || [])
        } else {
          setError(data.message || 'Hiba történt a hirdetések betöltése során')
        }
      } catch (err) {
        console.error('Hirdetések betöltési hiba:', err)
        setError('Hiba történt a hirdetések betöltése során')
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [token])

  // Mentett hirdetések betöltése
  useEffect(() => {
    const fetchFavoriteAds = async () => {
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) {
          setFavoritesError('Nincs bejelentkezve')
          setLoadingFavorites(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/favorites`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          // A favorite.ad objektumokat tároljuk
          setFavoriteAds(data.favorites.map(fav => fav.ad).filter(ad => ad !== null))
        } else {
          setFavoritesError(data.message || 'Hiba történt a mentett hirdetések betöltése során')
        }
      } catch (err) {
        console.error('Mentett hirdetések betöltési hiba:', err)
        setFavoritesError('Hiba történt a mentett hirdetések betöltése során')
      } finally {
        setLoadingFavorites(false)
      }
    }

    fetchFavoriteAds()
  }, [token])

  // Felhasználói információk betöltése
  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoadingUserInfo(true)
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) {
          setLoadingUserInfo(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setUserInfo(data.user)
        }
      } catch (err) {
        console.error('Felhasználói információk betöltési hiba:', err)
      } finally {
        setLoadingUserInfo(false)
      }
    }

    fetchUserInfo()
  }, [token])

  // Vélemények betöltése
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true)
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) {
          setLoadingReviews(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setReviews(data.reviews || [])
        }
      } catch (err) {
        console.error('Vélemények betöltési hiba:', err)
      } finally {
        setLoadingReviews(false)
      }
    }

    if (activeTab === 'reviews') {
      fetchReviews()
    }
  }, [token, activeTab])

  // Megrendelések betöltése (vásárló)
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true)
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) {
          setLoadingOrders(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setOrders(data.orders || [])
          // Értesítések frissítése is
          const notifResponse = await fetch(`${API_BASE_URL}/orders/notifications/count`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
                                              const notifData = await notifResponse.json()
                                              if (notifResponse.ok && notifData.success) {
                                                setInTransitOrdersCount(notifData.inTransitOrders || 0)
                                              }
        }
      } catch (err) {
        console.error('Megrendelések betöltési hiba:', err)
      } finally {
        setLoadingOrders(false)
      }
    }

    if (activeTab === 'orders') {
      fetchOrders()
      // Frissítés 30 másodpercenként
      const interval = setInterval(fetchOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [token, activeTab])

  // Eladások betöltése (eladó)
  useEffect(() => {
    const fetchSales = async () => {
      setLoadingSales(true)
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) {
          setLoadingSales(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/orders/my-sales`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setSales(data.orders || [])
          // Értesítések frissítése is
          const notifResponse = await fetch(`${API_BASE_URL}/orders/notifications/count`, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          })
          const notifData = await notifResponse.json()
          if (notifResponse.ok && notifData.success) {
            setPendingSalesCount(notifData.pendingSales || 0)
          }
        }
      } catch (err) {
        console.error('Eladások betöltési hiba:', err)
      } finally {
        setLoadingSales(false)
      }
    }

    if (activeTab === 'sales') {
      fetchSales()
      // Frissítés 30 másodpercenként
      const interval = setInterval(fetchSales, 30000)
      return () => clearInterval(interval)
    }
  }, [token, activeTab])

  // Mentett keresések betöltése
  useEffect(() => {
    const fetchSavedSearches = async () => {
      if (activeTab !== 'watches') return
      
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) {
          setLoadingSavedSearches(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/saved-searches`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setSavedSearches(data.savedSearches || [])
        }
      } catch (err) {
        console.error('Mentett keresések betöltési hiba:', err)
      } finally {
        setLoadingSavedSearches(false)
      }
    }

    fetchSavedSearches()
    
    // Frissítés 30 másodpercenként
    const interval = setInterval(fetchSavedSearches, 30000)
    return () => clearInterval(interval)
  }, [token, activeTab])

  // Mentett keresések értesítéseinek számlálója
  useEffect(() => {
    const fetchSavedSearchesNotifications = async () => {
      const authToken = token || localStorage.getItem('token')
      if (!authToken) {
        setSavedSearchesNotificationsCount(0)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/saved-searches/notifications/count`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setSavedSearchesNotificationsCount(data.count || 0)
        }
      } catch (err) {
        console.error('Mentett keresések értesítéseinek betöltési hiba:', err)
      }
    }

    fetchSavedSearchesNotifications()
    
    // Frissítés 30 másodpercenként
    const interval = setInterval(fetchSavedSearchesNotifications, 30000)
    return () => clearInterval(interval)
  }, [token])

  // Értesítések számlálójának betöltése
  useEffect(() => {
    const fetchNotifications = async () => {
      const authToken = token || localStorage.getItem('token')
      if (!authToken) return

      try {
        const response = await fetch(`${API_BASE_URL}/orders/notifications/count`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setPendingSalesCount(data.pendingSales || 0)
          setInTransitOrdersCount(data.inTransitOrders || 0)
        }
      } catch (err) {
        console.error('Értesítések betöltési hiba:', err)
      }
    }

    if (isAuthenticated) {
      fetchNotifications()
      // Frissítés 30 másodpercenként
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [token, isAuthenticated])

  // Felhasználó értékeléseinek betöltése
  useEffect(() => {
    const fetchUserRatings = async () => {
      if (!user?.id || activeTab !== 'info') return

      setLoadingRatings(true)
      try {
        const response = await fetch(`${API_BASE_URL}/ratings/user/${user.id}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setUserRatings({
            positiveCount: data.positiveCount || 0,
            negativeCount: data.negativeCount || 0
          })
        }
      } catch (err) {
        console.error('Értékelések betöltési hiba:', err)
      } finally {
        setLoadingRatings(false)
      }
    }

    fetchUserRatings()
  }, [user?.id, activeTab])

  // Hirdetés törlése
  const handleDeleteAd = async (adId) => {
    try {
      const authToken = token || localStorage.getItem('token')
      if (!authToken) {
        alert('Nincs bejelentkezve')
        return
      }

      const response = await fetch(`${API_BASE_URL}/ads/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Hirdetés eltávolítása a listából
        setAds(ads.filter(ad => ad._id !== adId))
        alert('Hirdetés sikeresen törölve')
      } else {
        alert(data.message || 'Hiba történt a hirdetés törlése során')
      }
    } catch (err) {
      console.error('Hirdetés törlési hiba:', err)
      alert('Hiba történt a hirdetés törlése során')
    }
  }

  // Mentett hirdetés törlése
  const handleDeleteFavorite = async (adId) => {
    try {
      const authToken = token || localStorage.getItem('token')
      if (!authToken) {
        alert('Nincs bejelentkezve')
        return
      }

      const response = await fetch(`${API_BASE_URL}/favorites/${adId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Mentett hirdetés eltávolítása a listából
        setFavoriteAds(favoriteAds.filter(ad => ad._id !== adId))
        alert('Hirdetés sikeresen eltávolítva a mentettek közül')
      } else {
        alert(data.message || 'Hiba történt a mentett hirdetés törlése során')
      }
    } catch (err) {
      console.error('Mentett hirdetés törlési hiba:', err)
      alert('Hiba történt a mentett hirdetés törlése során')
    }
  }

  // Telefonszám módosítása
  const handleUpdatePhone = async (newPhone) => {
    const authToken = token || localStorage.getItem('token')
    if (!authToken) {
      throw new Error('Nincs bejelentkezve')
    }

    const response = await fetch(`${API_BASE_URL}/auth/update-phone`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ phone: newPhone })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Hiba történt a telefonszám módosítása során')
    }

    // Frissítjük a felhasználói adatokat
    if (data.user) {
      setUserInfo(data.user)
      // Frissítjük az AuthContext-et is
      login({
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.fullName,
        phone: data.user.phone,
        city: data.user.city
      }, authToken)
    }

    alert('Telefonszám sikeresen módosítva!')
  }

  // Jelszó módosítása
  const handleUpdatePassword = async (currentPassword, newPassword, confirmPassword) => {
    const authToken = token || localStorage.getItem('token')
    if (!authToken) {
      throw new Error('Nincs bejelentkezve')
    }

    const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Hiba történt a jelszó módosítása során')
    }

    alert('Jelszó sikeresen módosítva!')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Vélemény létrehozása/szerkesztése
  const handleSaveReview = async (reviewData) => {
    const authToken = token || localStorage.getItem('token')
    if (!authToken) {
      throw new Error('Nincs bejelentkezve')
    }

    const url = editingReview
      ? `${API_BASE_URL}/reviews/${editingReview._id}`
      : `${API_BASE_URL}/reviews`
    
    const method = editingReview ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(reviewData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Hiba történt a vélemény mentése során')
    }

    // Frissítjük a vélemények listáját
    const fetchReviews = async () => {
      const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setReviews(data.reviews || [])
      }
    }
    await fetchReviews()

    alert(editingReview ? 'Vélemény sikeresen módosítva!' : 'Vélemény sikeresen létrehozva!')
    setEditingReview(null)
  }

  // Vélemény szerkesztése
  const handleEditReview = (review) => {
    setEditingReview(review)
    setShowCreateReviewModal(true)
  }

  // Vélemény törlése
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a véleményt?')) {
      return
    }

    const authToken = token || localStorage.getItem('token')
    if (!authToken) {
      alert('Nincs bejelentkezve')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setReviews(reviews.filter(review => review._id !== reviewId))
        alert('Vélemény sikeresen törölve!')
      } else {
        alert(data.message || 'Hiba történt a vélemény törlése során')
      }
    } catch (err) {
      console.error('Vélemény törlési hiba:', err)
      alert('Hálózati hiba történt a vélemény törlése során')
    }
  }

  // A megjelenítendő felhasználói adatok
  const displayUser = userInfo || user


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Navbar />
        <div className="px-4 py-8 mx-auto">
          <h1 className="text-3xl font-bold text-black mb-6">
            Profil
          </h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Tab navigáció */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => navigate('/profile')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === 'my-ads' || !searchParams.get('tab')
                    ? 'text-blue-800 border-b-2 border-blue-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Hirdetéseim
              </button>
              <button
                onClick={() => navigate('/profile?tab=favorites')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === 'favorites'
                    ? 'text-blue-800 border-b-2 border-blue-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Mentett hirdetések
              </button>
              <button
                onClick={() => navigate('/profile?tab=info')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'text-blue-800 border-b-2 border-blue-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Információk
              </button>
              <button
                onClick={() => navigate('/profile?tab=reviews')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-blue-800 border-b-2 border-blue-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Vélemények
              </button>
              <button
                onClick={() => navigate('/profile?tab=orders')}
                className={`pb-3 px-4 font-medium transition-colors relative ${
                  activeTab === 'orders'
                    ? 'text-blue-800 border-b-2 border-blue-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Megrendelések
                {inTransitOrdersCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => navigate('/profile?tab=sales')}
                className={`pb-3 px-4 font-medium transition-colors relative ${
                  activeTab === 'sales'
                    ? 'text-blue-800 border-b-2 border-blue-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Eladások
                {pendingSalesCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={() => navigate('/profile?tab=watches')}
                className={`pb-3 px-4 font-medium transition-colors relative ${
                  activeTab === 'watches'
                    ? 'text-blue-800 border-b-2 border-blue-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Hirdetésfigyelő
                {savedSearchesNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>

            {/* Hirdetéseim tab */}
            {activeTab === 'my-ads' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Hirdetéseim</h2>
                
                {loading ? (
                  <p className="text-gray-600">Betöltés...</p>
                ) : error ? (
                  <p className="text-red-600">{error}</p>
                ) : ads.length === 0 ? (
                  <p className="text-gray-600">Még nincs hirdetésed. <Link to="/create-ad" className="text-blue-800 hover:underline">Hozz létre egyet!</Link></p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ads.map((ad) => (
                      <AdCard
                        key={ad._id}
                        ad={ad}
                        onDelete={handleDeleteAd}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mentett hirdetések tab */}
            {activeTab === 'favorites' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Mentett hirdetések</h2>
                
                {loadingFavorites ? (
                  <p className="text-gray-600">Betöltés...</p>
                ) : favoritesError ? (
                  <p className="text-red-600">{favoritesError}</p>
                ) : favoriteAds.length === 0 ? (
                  <p className="text-gray-600">Még nincsenek mentett hirdetéseid.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {favoriteAds.map((ad) => (
                      <Card 
                        key={ad._id} 
                        ad={ad} 
                        showDeleteButton={true}
                        onDeleteFavorite={handleDeleteFavorite}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Információk tab */}
            {activeTab === 'info' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-6">Felhasználói információk</h2>
                
                {loadingUserInfo ? (
                  <p className="text-gray-600">Betöltés...</p>
                ) : (
                  <div className="space-y-6">
                    {/* Név */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Név</label>
                      <p className="text-gray-900 text-lg">{displayUser?.fullName || displayUser?.name || 'N/A'}</p>
                    </div>

                    {/* Email */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email cím</label>
                      <p className="text-gray-900 text-lg">{displayUser?.email || 'N/A'}</p>
                    </div>

                    {/* Telefonszám */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Telefonszám</label>
                          <p className="text-gray-900 text-lg">{displayUser?.phone || 'N/A'}</p>
                        </div>
                        <button
                          onClick={() => setShowPhoneModal(true)}
                          className="ml-4 px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 transition-colors cursor-pointer"
                        >
                          Módosítás
                        </button>
                      </div>
                    </div>

                    {/* Település */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Település</label>
                      <p className="text-gray-900 text-lg">{displayUser?.city || 'N/A'}</p>
                    </div>

                    {/* Jelszó */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Jelszó</label>
                          <p className="text-gray-900 text-lg">••••••••</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="ml-4 px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 transition-colors cursor-pointer"
                        >
                          Módosítás
                        </button>
                      </div>
                    </div>

                    {/* Értékelések */}
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Értékelések</label>
                      {loadingRatings ? (
                        <p className="text-gray-600">Betöltés...</p>
                      ) : (
                        <div className="flex gap-6">
                          <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            <span className="text-gray-900 text-lg font-semibold">{userRatings.positiveCount}</span>
                            <span className="text-gray-600">pozitív értékelés</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            <span className="text-gray-900 text-lg font-semibold">{userRatings.negativeCount}</span>
                            <span className="text-gray-600">negatív értékelés</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Kijelentkezés gomb */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Kijelentkezés
                  </button>
                </div>
              </div>
            )}

            {/* Vélemények tab */}
            {activeTab === 'reviews' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-700">Véleményeim</h2>
                  <button
                    onClick={() => {
                      setEditingReview(null)
                      setShowCreateReviewModal(true)
                    }}
                    className="px-4 py-2 rounded-full bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Új vélemény
                  </button>
                </div>
                
                {loadingReviews ? (
                  <p className="text-gray-600">Vélemények betöltése...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-600">Még nem írtál véleményt.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        showActions={true}
                        onEdit={handleEditReview}
                        onDelete={handleDeleteReview}
                      />
                    ))}
                  </div>
                )}

                {/* Kijelentkezés gomb */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Kijelentkezés
                  </button>
                </div>
              </div>
            )}

            {/* Megrendelések tab */}
            {activeTab === 'orders' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Megrendeléseim</h2>
                
                {loadingOrders ? (
                  <p className="text-gray-600">Betöltés...</p>
                ) : orders.length === 0 ? (
                  <p className="text-gray-600">Még nincs megrendelésed.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const primaryImage = order.ad?.images?.find(img => img.isPrimary) || order.ad?.images?.[0]
                      const expectedDate = new Date(order.expectedDeliveryDate)
                      const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']
                      const months = ['január', 'február', 'március', 'április', 'május', 'június', 
                                     'július', 'augusztus', 'szeptember', 'október', 'november', 'december']
                      const formattedDate = `${days[expectedDate.getDay()]}, ${expectedDate.getDate()}. ${months[expectedDate.getMonth()]}`

                      return (
                        <div key={order._id} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Termék információ */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">{order.ad?.title}</h3>
                              {primaryImage && (
                                <img 
                                  src={primaryImage.url} 
                                  alt={order.ad?.title}
                                  className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                              )}
                              <p className="text-gray-600 text-sm">Kategória: {order.ad?.category}</p>
                              <p className="text-lg font-bold text-gray-900 mt-2">
                                {order.productPrice.toLocaleString('hu-HU')} Ft
                              </p>
                            </div>

                            {/* Rendelés részletek */}
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Rendelés részletei</h4>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Szállítási mód:</span> {order.shippingMethod}
                              </p>
                              {order.shippingPointName && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Csomagpont:</span> {order.shippingPointName}
                                </p>
                              )}
                              {order.shippingPointAddress && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Cím:</span> {order.shippingPointAddress}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Szállítási költség:</span> {order.shippingCost.toLocaleString('hu-HU')} Ft
                              </p>
                              <p className="text-lg font-bold text-blue-800 mt-2">
                                Összesen: {order.totalPrice.toLocaleString('hu-HU')} Ft
                              </p>
                            </div>

                            {/* Státusz és dátum */}
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Rendelés státusza</h4>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Várható érkezés:</span> {formattedDate}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Státusz:</span> {
                                  order.status === 'pending' ? 'Függőben' :
                                  order.status === 'confirmed' ? 'Megerősítve' :
                                  order.status === 'in_transit' ? 'Szállítás alatt' :
                                  order.status === 'received' ? 'Átvéve' :
                                  'Törölve'
                                }
                              </p>
                              <div className="flex flex-col gap-2">
                                {order.status === 'in_transit' && (
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm('Biztosan átvetted a csomagot?')) {
                                        return
                                      }

                                      const authToken = token || localStorage.getItem('token')
                                      if (!authToken) return

                                      try {
                                        const response = await fetch(`${API_BASE_URL}/orders/${order._id}/status`, {
                                          method: 'PUT',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${authToken}`
                                          },
                                          body: JSON.stringify({ status: 'received' })
                                        })

                                        const data = await response.json()

                                        if (response.ok && data.success) {
                                          // Frissítjük a rendelések listáját
                                          const fetchOrders = async () => {
                                            const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
                                              headers: {
                                                'Authorization': `Bearer ${authToken}`
                                              }
                                            })
                                            const data = await response.json()
                                            if (response.ok && data.success) {
                                              setOrders(data.orders || [])
                                              // Értesítések frissítése
                                              const notifResponse = await fetch(`${API_BASE_URL}/orders/notifications/count`, {
                                                headers: {
                                                  'Authorization': `Bearer ${authToken}`
                                                }
                                              })
                                              const notifData = await notifResponse.json()
                                              if (notifResponse.ok && notifData.success) {
                                                setInTransitOrdersCount(notifData.inTransitOrders || 0)
                                              }
                                            }
                                          }
                                          await fetchOrders()
                                          alert('Rendelés státusza sikeresen módosítva!')
                                        } else {
                                          alert(data.message || 'Hiba történt a státusz módosítása során')
                                        }
                                      } catch (err) {
                                        console.error('Státusz módosítási hiba:', err)
                                        alert('Hálózati hiba történt')
                                      }
                                    }}
                                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                                  >
                                    Átvéve
                                  </button>
                                )}
                                {order.status === 'received' && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderForRating(order)
                                      setShowRatingModal(true)
                                    }}
                                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                                  >
                                    Értékelés
                                  </button>
                                )}
                                <button
                                  onClick={() => navigate(`/product/${order.ad?._id}`)}
                                  className="px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 transition-colors cursor-pointer"
                                >
                                  Hirdetés megtekintése
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Kijelentkezés gomb */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Kijelentkezés
                  </button>
                </div>
              </div>
            )}

            {/* Eladások tab */}
            {activeTab === 'sales' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Eladásaim</h2>
                
                {loadingSales ? (
                  <p className="text-gray-600">Betöltés...</p>
                ) : sales.length === 0 ? (
                  <p className="text-gray-600">Még nincs eladásod.</p>
                ) : (
                  <div className="space-y-4">
                    {sales.map((order) => {
                      const primaryImage = order.ad?.images?.find(img => img.isPrimary) || order.ad?.images?.[0]
                      const expectedDate = new Date(order.expectedDeliveryDate)
                      const days = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']
                      const months = ['január', 'február', 'március', 'április', 'május', 'június', 
                                     'július', 'augusztus', 'szeptember', 'október', 'november', 'december']
                      const formattedDate = `${days[expectedDate.getDay()]}, ${expectedDate.getDate()}. ${months[expectedDate.getMonth()]}`

                      return (
                        <div key={order._id} className={`${order.status === 'pending' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-md`}>
                          {order.status === 'pending' && (
                            <div className="mb-4">
                              <div className="inline-block px-3 py-1 bg-blue-800 text-blue-200 rounded-full text-sm font-medium mb-3">
                                Új rendelés!
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Termék információ */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">{order.ad?.title}</h3>
                              {primaryImage && (
                                <img 
                                  src={primaryImage.url} 
                                  alt={order.ad?.title}
                                  className="w-full h-32 object-cover rounded-lg mb-2"
                                />
                              )}
                              <p className="text-gray-600 text-sm">Kategória: {order.ad?.category}</p>
                              <p className="text-lg font-bold text-gray-900 mt-2">
                                {order.productPrice.toLocaleString('hu-HU')} Ft
                              </p>
                            </div>

                            {/* Vásárló adatai */}
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Vásárló adatai</h4>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Név:</span> {order.buyerName || order.buyer?.fullName || order.buyer?.name || 'Ismeretlen felhasználó'}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Email:</span> {order.buyerEmail}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Telefon:</span> {order.buyerPhone}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Szállítási mód:</span> {order.shippingMethod}
                              </p>
                              {order.shippingPointName && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Csomagpont:</span> {order.shippingPointName}
                                </p>
                              )}
                              {order.shippingPointAddress && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <span className="font-medium">Csomagpont cím:</span> {order.shippingPointAddress}
                                </p>
                              )}
                            </div>

                            {/* Rendelés információ */}
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Rendelés információ</h4>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Várható érkezés:</span> {formattedDate}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Szállítási költség:</span> {order.shippingCost.toLocaleString('hu-HU')} Ft
                              </p>
                              <p className="text-lg font-bold text-blue-800 mt-2">
                                Összesen: {order.totalPrice.toLocaleString('hu-HU')} Ft
                              </p>
                              <p className="text-sm text-gray-600 mb-2 mt-2">
                                <span className="font-medium">Státusz:</span> {
                                  order.status === 'pending' ? 'Függőben' :
                                  order.status === 'confirmed' ? 'Megerősítve' :
                                  order.status === 'in_transit' ? 'Szállítás alatt' :
                                  order.status === 'received' ? 'Átvéve' :
                                  'Törölve'
                                }
                              </p>
                              <div className="flex flex-col gap-2">
                                {(order.status === 'pending' || order.status === 'confirmed') && (
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm('Biztosan "Szállítás alatt" státuszra állítod a rendelést?')) {
                                        return
                                      }

                                      const authToken = token || localStorage.getItem('token')
                                      if (!authToken) return

                                      try {
                                        const response = await fetch(`${API_BASE_URL}/orders/${order._id}/status`, {
                                          method: 'PUT',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${authToken}`
                                          },
                                          body: JSON.stringify({ status: 'in_transit' })
                                        })

                                        const data = await response.json()

                                        if (response.ok && data.success) {
                                          // Frissítjük a rendelések listáját
                                          const fetchSales = async () => {
                                            const response = await fetch(`${API_BASE_URL}/orders/my-sales`, {
                                              headers: {
                                                'Authorization': `Bearer ${authToken}`
                                              }
                                            })
                                            const data = await response.json()
                                            if (response.ok && data.success) {
                                              setSales(data.orders || [])
                                              // Értesítések frissítése
                                              const notifResponse = await fetch(`${API_BASE_URL}/orders/notifications/count`, {
                                                headers: {
                                                  'Authorization': `Bearer ${authToken}`
                                                }
                                              })
                                              const notifData = await notifResponse.json()
                                              if (notifResponse.ok && notifData.success) {
                                                setPendingSalesCount(notifData.pendingSales || 0)
                                              }
                                            }
                                          }
                                          await fetchSales()
                                          alert('Rendelés státusza sikeresen módosítva!')
                                        } else {
                                          alert(data.message || 'Hiba történt a státusz módosítása során')
                                        }
                                      } catch (err) {
                                        console.error('Státusz módosítási hiba:', err)
                                        alert('Hálózati hiba történt')
                                      }
                                    }}
                                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
                                  >
                                    Feladva
                                  </button>
                                )}
                                {order.status === 'received' && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrderForRating(order)
                                      setShowRatingModal(true)
                                    }}
                                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                                  >
                                    Értékelés
                                  </button>
                                )}
                                <button
                                  onClick={() => navigate(`/product/${order.ad?._id}`)}
                                  className="px-4 py-2 rounded-lg bg-blue-800 text-blue-200 text-sm font-medium hover:bg-blue-900 transition-colors cursor-pointer"
                                >
                                  Hirdetés megtekintése
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Kijelentkezés gomb */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Kijelentkezés
                  </button>
                </div>
              </div>
            )}

            {/* Hirdetésfigyelő tab */}
            {activeTab === 'watches' && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Hirdetésfigyelő</h2>
                
                {loadingSavedSearches ? (
                  <p className="text-gray-600">Betöltés...</p>
                ) : savedSearches.length === 0 ? (
                  <p className="text-gray-600">Még nincs mentett keresésed.</p>
                ) : (
                  <div className="space-y-4">
                    {savedSearches.map((savedSearch) => {
                      const params = savedSearch.searchParams
                      const searchDescription = [
                        params.query && `Keresés: "${params.query}"`,
                        params.category && `Kategória: ${params.category}`,
                        params.subCategory && `Alkategória: ${params.subCategory}`,
                        params.location && `Település: ${params.location}`,
                        params.minPrice && `Min. ár: ${params.minPrice.toLocaleString('hu-HU')} Ft`,
                        params.maxPrice && `Max. ár: ${params.maxPrice.toLocaleString('hu-HU')} Ft`
                      ].filter(Boolean).join(', ')

                      return (
                        <div key={savedSearch._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <p className="text-gray-700 font-medium mb-2">{searchDescription || 'Keresés mentés'}</p>
                              <p className="text-sm text-gray-500">
                                Mentve: {new Date(savedSearch.createdAt).toLocaleDateString('hu-HU')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  const authToken = token || localStorage.getItem('token')
                                  if (!authToken) return

                                  setLoadingNewAds(true)
                                  try {
                                    const response = await fetch(`${API_BASE_URL}/saved-searches/${savedSearch._id}/new-ads`, {
                                      headers: {
                                        'Authorization': `Bearer ${authToken}`
                                      }
                                    })
                                    const data = await response.json()

                                    if (response.ok && data.success) {
                                      setNewAdsForSearch(data.newAds || [])
                                      setSelectedSavedSearch(savedSearch._id)
                                      // Frissítjük a keresések listáját
                                      const fetchSavedSearches = async () => {
                                        const res = await fetch(`${API_BASE_URL}/saved-searches`, {
                                          headers: {
                                            'Authorization': `Bearer ${authToken}`
                                          }
                                        })
                                        const savedData = await res.json()
                                        if (res.ok && savedData.success) {
                                          setSavedSearches(savedData.savedSearches || [])
                                        }
                                      }
                                      await fetchSavedSearches()
                                    }
                                  } catch (err) {
                                    console.error('Új hirdetések betöltési hiba:', err)
                                    alert('Hiba történt az új hirdetések betöltése során')
                                  } finally {
                                    setLoadingNewAds(false)
                                  }
                                }}
                                className="px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 transition-colors cursor-pointer"
                              >
                                Új hirdetések
                              </button>
                              <button
                                onClick={async () => {
                                  if (!window.confirm('Biztosan törölni szeretnéd ezt a mentett keresést?')) {
                                    return
                                  }

                                  const authToken = token || localStorage.getItem('token')
                                  if (!authToken) return

                                  try {
                                    const response = await fetch(`${API_BASE_URL}/saved-searches/${savedSearch._id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': `Bearer ${authToken}`
                                      }
                                    })
                                    const data = await response.json()

                                    if (response.ok && data.success) {
                                      // Frissítjük a keresések listáját
                                      const fetchSavedSearches = async () => {
                                        const res = await fetch(`${API_BASE_URL}/saved-searches`, {
                                          headers: {
                                            'Authorization': `Bearer ${authToken}`
                                          }
                                        })
                                        const savedData = await res.json()
                                        if (res.ok && savedData.success) {
                                          setSavedSearches(savedData.savedSearches || [])
                                        }
                                      }
                                      await fetchSavedSearches()
                                      // Frissítjük az értesítések számát
                                      const notifResponse = await fetch(`${API_BASE_URL}/saved-searches/notifications/count`, {
                                        headers: {
                                          'Authorization': `Bearer ${authToken}`
                                        }
                                      })
                                      const notifData = await notifResponse.json()
                                      if (notifResponse.ok && notifData.success) {
                                        setSavedSearchesNotificationsCount(notifData.count || 0)
                                      }
                                    } else {
                                      alert(data.message || 'Hiba történt a törlés során')
                                    }
                                  } catch (err) {
                                    console.error('Törlési hiba:', err)
                                    alert('Hiba történt a törlés során')
                                  }
                                }}
                                className="px-4 py-2 rounded-lg bg-red-200 text-red-800 text-sm font-medium hover:bg-red-300 transition-colors cursor-pointer"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {selectedSavedSearch === savedSearch._id && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                              {loadingNewAds ? (
                                <p className="text-gray-600">Betöltés...</p>
                              ) : newAdsForSearch.length === 0 ? (
                                <p className="text-gray-600">Nincs új hirdetés.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                  {newAdsForSearch.map((ad) => (
                                    <Card key={ad._id} ad={ad} />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Kijelentkezés gomb (ha nem az info, reviews, orders, sales vagy watches tab-on vagyunk) */}
            {activeTab !== 'info' && activeTab !== 'reviews' && activeTab !== 'orders' && activeTab !== 'sales' && activeTab !== 'watches' && (
              <button
                onClick={handleLogout}
                className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
              >
                Kijelentkezés
              </button>
            )}
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Modalok */}
      {showPhoneModal && (
        <UpdatePhoneModal
          onClose={() => setShowPhoneModal(false)}
          currentPhone={displayUser?.phone || ''}
          onUpdate={handleUpdatePhone}
        />
      )}
      
      {showPasswordModal && (
        <UpdatePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onUpdate={handleUpdatePassword}
        />
      )}
      
      {showCreateReviewModal && (
        <CreateReviewModal
          onClose={() => {
            setShowCreateReviewModal(false)
            setEditingReview(null)
          }}
          onSave={handleSaveReview}
          editingReview={editingReview}
          token={token}
        />
      )}

      {showRatingModal && selectedOrderForRating && (
        <RatingModal
          onClose={() => {
            setShowRatingModal(false)
            setSelectedOrderForRating(null)
          }}
          order={selectedOrderForRating}
          token={token}
          onRatingSubmitted={() => {
            // Frissítjük a rendelések/eladások listáját
            if (activeTab === 'orders') {
              const fetchOrders = async () => {
                const authToken = token || localStorage.getItem('token')
                if (!authToken) return
                const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
                  headers: { 'Authorization': `Bearer ${authToken}` }
                })
                const data = await response.json()
                if (response.ok && data.success) {
                  setOrders(data.orders || [])
                }
              }
              fetchOrders()
            } else if (activeTab === 'sales') {
              const fetchSales = async () => {
                const authToken = token || localStorage.getItem('token')
                if (!authToken) return
                const response = await fetch(`${API_BASE_URL}/orders/my-sales`, {
                  headers: { 'Authorization': `Bearer ${authToken}` }
                })
                const data = await response.json()
                if (response.ok && data.success) {
                  setSales(data.orders || [])
                }
              }
              fetchSales()
            }
          }}
        />
      )}
    </div>
  )
}

const ProfilePage = () => {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  )
}

export default ProfilePage

