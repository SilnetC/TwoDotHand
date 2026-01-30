import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [notificationCount, setNotificationCount] = useState(0)
  const [savedSearchesNotificationCount, setSavedSearchesNotificationCount] = useState(0)

  // Értesítések betöltése
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !token) {
        setNotificationCount(0)
        setSavedSearchesNotificationCount(0)
        return
      }

      try {
        // Rendelési értesítések
        const ordersResponse = await fetch(`${API_BASE_URL}/orders/notifications/count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const ordersData = await ordersResponse.json()
        if (ordersResponse.ok && ordersData.success) {
          setNotificationCount(ordersData.total || 0)
        }

        // Mentett keresések értesítései
        const savedSearchesResponse = await fetch(`${API_BASE_URL}/saved-searches/notifications/count`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const savedSearchesData = await savedSearchesResponse.json()
        if (savedSearchesResponse.ok && savedSearchesData.success) {
          setSavedSearchesNotificationCount(savedSearchesData.count || 0)
        }
      } catch (error) {
        console.error('Értesítések betöltési hiba:', error)
      }
    }

    fetchNotifications()

    // Frissítés 30 másodpercenként
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, token])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  return (
    <nav className="mx-4 mt-4 rounded-lg bg-white shadow-md px-6 py-4 w-full">
      {/* Fő navigációs sáv */}
      <div className="flex items-center justify-between">
        {/* Logo - balra igazítva */}
        <Link to="/" className="shrink-0">
          <h1 className="text-2xl font-bold text-black">TwoDotHand</h1>
        </Link>

        {/* Menüpontok - középre igazítva (desktop) */}
        <div className="hidden md:flex items-center space-x-6 flex-1 justify-center">
          <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:rounded-md after:bg-blue-800 after:transition-all hover:after:w-full">
            Kategóriák
          </Link>
          <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:rounded-md after:bg-blue-800 after:transition-all hover:after:w-full">
            Vásárlás
          </Link>
          <Link to="/create-ad" className="text-gray-700 hover:text-gray-900 font-medium relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:rounded-md after:bg-blue-800 after:transition-all hover:after:w-full">
            Hirdetés feladás
          </Link>
        </div>

        {/* Gombok - jobbra igazítva (desktop) */}
        <div className="hidden md:flex items-center space-x-3 shrink-0">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile?tab=favorites"
                className="px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 hover:cursor-pointer transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Mentett
              </Link>
              <Link
                to="/profile"
                className="px-4 py-2 rounded-lg bg-blue-800 text-blue-200 text-sm font-medium hover:bg-blue-900 hover:cursor-pointer transition-colors relative"
              >
                {user?.fullName || user?.name || 'Profil'}
                {(notificationCount > 0 || savedSearchesNotificationCount > 0) && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {(notificationCount + savedSearchesNotificationCount) > 9 ? '9+' : (notificationCount + savedSearchesNotificationCount)}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-200 text-red-800 text-sm font-medium hover:bg-red-300 hover:cursor-pointer transition-colors"
              >
                Kijelentkezés
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-blue-800 text-blue-200 text-sm font-medium hover:bg-blue-900 hover:cursor-pointer transition-colors"
              >
                Bejelentkezés
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 hover:cursor-pointer transition-colors"
              >
                Regisztráció
              </Link>
            </>
          )}
        </div>

        {/* Hamburger menü gomb (mobil) */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col space-y-1.5 cursor-pointer"
          aria-label="Menü"
        >
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>

      {/* Mobil menü (lenyíló) */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pt-4 pb-2 space-y-4">
          {/* Menüpontok mobilon */}
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Kategóriák
            </Link>
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Vásárlás
            </Link>
            <Link
              to="/create-ad"
              className="text-gray-700 hover:text-gray-900 font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Hirdetés feladás
            </Link>
          </div>

          {/* Gombok mobilon */}
          <div className="flex flex-col space-y-3 pt-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile?tab=favorites"
                  className="px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 hover:cursor-pointer transition-colors w-full text-center flex items-center justify-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Mentett
                </Link>
                <Link
                  to="/profile"
                  className="px-4 py-2 rounded-lg bg-blue-800 text-blue-200 text-sm font-medium hover:bg-blue-900 hover:cursor-pointer transition-colors w-full text-center relative"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user?.fullName || user?.name || 'Profil'}
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>
                <button
                  className="px-4 py-2 rounded-lg bg-red-200 text-red-800 text-sm font-medium hover:bg-red-300 hover:cursor-pointer transition-colors w-full"
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                >
                  Kijelentkezés
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-blue-800 text-blue-200 text-sm font-medium hover:bg-blue-900 hover:cursor-pointer transition-colors w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Bejelentkezés
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-blue-200 text-blue-800 text-sm font-medium hover:bg-blue-300 hover:cursor-pointer transition-colors w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Regisztráció
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar