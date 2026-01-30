import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import RegisterSuccess from '../Components/Register/RegisterSuccess'
import { validateEmail, validatePhone, validatePasswordsMatch, validatePasswordStrength } from '../utils/validation'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    city: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Hibák törlése amikor a felhasználó elkezd gépelni
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    
    // Validációk
    const newErrors = {}

    // Email formátum ellenőrzése
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Érvényes email cím megadása kötelező'
    }

    // Telefonszám formátum ellenőrzése
    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Érvényes telefonszám megadása kötelező (pl: +36 20 123 4567)'
    }

    // Jelszó egyeztetés ellenőrzése
    if (!validatePasswordsMatch(formData.password, formData.confirmPassword)) {
      newErrors.confirmPassword = 'A jelszavak nem egyeznek meg'
    }

    // Jelszó erősség ellenőrzése
    if (!validatePasswordStrength(formData.password)) {
      newErrors.password = 'A jelszónak legalább 6 karakter hosszúnak kell lennie'
    }

    // Kötelező mezők ellenőrzése
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName || !formData.phone || !formData.city) {
      alert('Kérjük, töltse ki az összes mezőt!')
      return
    }

    // Ha vannak hibák, megjelenítjük őket
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      // API hívás a regisztrációhoz
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName,
          phone: formData.phone,
          city: formData.city
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
          alert(data.message)
        } else {
          alert('Regisztrációs hiba történt. Kérjük, próbálja újra.')
        }
        setIsLoading(false)
        return
      }

      // Sikeres regisztráció - token és user adatok mentése
      if (data.success && data.token && data.user) {
        // User adatok mentése és bejelentkeztetés (token is átadva)
        login({
          id: data.user.id,
          email: data.user.email,
          name: data.user.fullName,
          phone: data.user.phone,
          city: data.user.city
        }, data.token)
        
        setIsSuccess(true)
      } else {
        alert('Váratlan válasz formátum. Kérjük, próbálja újra.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Regisztrációs hiba:', error)
      console.error('API URL:', `${API_BASE_URL}/auth/register`)
      console.error('Error details:', error)
      
      // Részletesebb hibaüzenet
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.name === 'TypeError') {
        alert('Nem sikerült csatlakozni a szerverhez. Kérjük, ellenőrizze:\n1. A backend szerver fut-e (http://localhost:3000)\n2. A böngésző konzolt a részletes hibákért (F12)')
      } else {
        alert(`Hálózati hiba történt: ${error.message}. Kérjük, próbálja újra.`)
      }
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
          <Navbar />
          <div className="px-4 py-8">
            <div className="flex justify-center">
              <RegisterSuccess />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Navbar />
        <div className="px-4 py-8">
          {/* Cím */}
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-500 text-center mb-8">
            Regisztráció
          </h1>

          {/* Regisztrációs form */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-lg p-8 md:p-12">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Bal oldali oszlop */}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email cím
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="pelda@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        Jelszó
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="••••••••"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                        Jelszó megerősítése
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Jobb oldali oszlop */}
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                        Teljes név
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Teljes név"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefonszám
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="+36 20 123 4567"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                        Település
                      </label>
                      <p className="text-xs text-blue-600 mb-2">
                        Add meg azokat a településeket ahol kényelmesen át tudod venni a termékeket.
                      </p>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Település"
                      />
                    </div>
                  </div>
                </div>

                {/* Regisztráció gomb */}
                <div className="text-center mb-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {isLoading ? 'Regisztrálás...' : 'Regisztráció'}
                  </button>
                </div>

                {/* Bejelentkezés link */}
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    Már van fiókod?{' '}
                    <Link to="/login" className="text-blue-800 font-medium hover:underline">
                      Jelentkezz be
                    </Link>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default RegisterPage

