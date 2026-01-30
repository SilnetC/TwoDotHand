import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import forrestImage from '../assets/PlaceholderPhotos/Forrest.jpg'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      // Válasz tartalmának ellenőrzése
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('Nem JSON válasz:', text)
        throw new Error('A szerver nem JSON formátumban válaszolt')
      }

      if (!response.ok) {
        // Ha van hibaüzenet a válaszban
        if (data.message) {
          setError(data.message)
        } else {
          setError('Bejelentkezési hiba történt. Kérjük, próbálja újra.')
        }
        setIsLoading(false)
        return
      }

      // Sikeres bejelentkezés - token és user adatok mentése
      if (data.success && data.token && data.user) {
        login({
          id: data.user.id,
          email: data.user.email,
          name: data.user.fullName,
          phone: data.user.phone,
          city: data.user.city
        }, data.token)
        
        navigate('/')
      } else {
        setError('Váratlan válasz formátum. Kérjük, próbálja újra.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Bejelentkezési hiba:', error)
      setError('Hálózati hiba történt. Kérjük, ellenőrizze az internetkapcsolatot és próbálja újra.')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // Google bejelentkezés implementációja
    console.log('Google bejelentkezés')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Navbar />
        <div className="px-4 py-8">
          {/* Cím */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-500 text-center mb-8">
            Bejelentkezés
          </h1>

          {/* Fő tartalom - két részre osztva */}
          <div className="w-full rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
              {/* Bal oldal - Form */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email cím */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">
                      Email cím
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="pelda@email.com"
                    />
                  </div>

                  {/* Jelszó */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-600 mb-2">
                      Jelszó
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Emlékezz rám és Elfelejtett jelszó */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        id="rememberMe"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-gray-700">
                        Emlékezz rám
                      </label>
                    </div>
                    <Link to="#" className="text-sm text-gray-500 font-light hover:underline">
                      Elfelejtett jelszó?
                    </Link>
                  </div>

                  {/* Hibaüzenet */}
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                      {error}
                    </div>
                  )}

                  {/* Bejelentkezés gomb */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
                  </button>

                  {/* Google bejelentkezés gomb */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 rounded-full bg-gray-200 text-blaxk font-medium hover:bg-gray-500 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Bejelentkezés Google fiókkal
                  </button>
                </form>

                {/* Fiók létrehozása link */}
                <div className="mt-6 text-right">
                  <Link to="/register" className="text-sm text-gray-600 hover:underline">
                    Nincs fiókod? Fiók létrehozása
                  </Link>
                </div>
              </div>

              {/* Jobb oldal - Kép */}
              <div className="hidden lg:block">
                <img
                  src={forrestImage}
                  alt="Forrest"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default LoginPage

