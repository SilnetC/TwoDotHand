import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from '../Components/ProtectedRoute'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import SuccessModal from '../Components/CreateAd/SuccessModal'
import { appleColors, conditionOptions, warrantyOptions } from '../utils/appleColors'
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

const CreateAdPageContent = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const fileInputRef = useRef(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
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

  // Alkategóriák (példa iPhone-hoz)
  const subCategories = {
    iPhone: [
      'iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max', 'iPhone Air',
      'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max', 
      'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
      'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
      'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max', 
      'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max', 
      'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max', 
      'iPhone SE', 'iPhone SE 2020', 'iPhone SE 2022',
      'iPhone X', 'iPhone 8', 'iPhone 8 Plus',
      'iPhone Xs', 'iPhone Xs Max', 'iPhone Xr',
      'iPhone 7', 'iPhone 7 Plus', 
      'iPhone 6s', 'iPhone 6s Plus',
      'iPhone 6', 'iPhone 6 Plus', 
      'iPhone 5s', 'iPhone 5c', 'iPhone 5', 
      'iPhone 4s', 'iPhone 4', 'iPhone 3gs', 'iPhone 3g', 'iPhone 3', 'iPhone 2g'
    ],
    iPad: [
      'iPad 1 (A4)', 'iPad 2 (A5)', 'iPad 3 (A5X)', 'iPad 4 (A6X)', 'iPad 5 (A9)', 'iPad 6 (A10)', 'iPad 7 (A10)', 'iPad 8 (A12)', 'iPad 9 (A13)', 'iPad 10 (A14)', 'iPad 11 (A16)',
      'iPad Mini 1', 'iPad Mini 2 (Retina)', 'iPad Mini 3 (A7)', 'iPad Mini 4 (A8)', 'iPad Mini 5 (A12)', 'iPad Mini 6 (A15)', 'iPad Mini 7 (A17)',
      'iPad Air 1 (A7)', 'iPad Air 2 (A8X)', 'iPad Air 3 (A12)', 'iPad Air 4 (A14)', 'iPad Air 5 (M1)', 'iPad Air 6 (M2)', 'iPad Air 7 (M3)',
      'iPad Pro 1 [9.7"] (A9X)', 'iPad Pro 1 [12.9"] (A9X)', 
      'iPad Pro 2 [10.5"] (A10X)', 'iPad Pro 2 [12.9"] (A10X)', 
      'iPad Pro 3 [11"] (A12X)', 'iPad Pro 3 [12.9"] (A12X)',
      'iPad Pro 4 [11"] (A12Z)', 'iPad Pro 4 [12.9"] (A12Z)',
      'iPad Pro 5 [11"] (M1)', 'iPad Pro 5 [12.9"] (M1)',
      'iPad Pro 6 [11"] (M2)', 'iPad Pro 6 [12.9"] (M2)',
      'iPad Pro 7 [11"] (M4)', 'iPad Pro 7 [12.9"] (M4)',
      'iPad Pro 8 [11"] (M5)', 'iPad Pro 8 [12.9"] (M5)',
    ],
    AirPods: [
      'AirPods 1st', 'AirPods 2nd', 'AirPods 3rd', 'AirPods 4th',
      'AirPods Pro', 'AirPods Pro 2', 'AirPods Pro 3',
      'AirPods Max', 
    ],
    AirTag: ['AirTag'],
    Kiegészítők: ['Töltő', 'Tok', 'Kábel', 'Egyéb'],
    Macbook: ['Macbook 12"', 'MacBook Pro', 'MacBook Air'],
    iMac: ['iMac 24"', 'iMac 27"'],
    'Mac Mini': ['Mac Mini (Intel)', 'Mac Mini (M1)', 'Mac Mini (M2)', 'Mac Mini (M2 Pro)', 'Mac Mini (M4)', 'Mac Mini (M4 Pro)'],
    'Mac Studio': ['Mac Studio'],
    Kijelzők: ['Studio Display', 'Pro Display XDR'],
    Egyéb: ['Egyéb'],
    'Apple Watch': [
      'Apple Watch Series 11', 'Apple Watch Series 10', 'Apple Watch Series 9', 'Apple Watch Series 8',
      'Apple Watch Series 7', 'Apple Watch Series 6', 'Apple Watch Series 5', 'Apple Watch Series 4',
      'Apple Watch Series 3', 'Apple Watch Series 2', 'Apple Watch Series 1', 'Apple Watch', 
      'Apple Watch Ultra', 'Apple Watch Ultra 2', 'Apple Watch Ultra 3', 'Apple Watch SE', 'Apple Watch SE 2 (Gen 2)', 'Apple Watch SE 3 (Gen 3)'
    ]
  }

  // State kezelés
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)
  const [images, setImages] = useState([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    warrantyStatus: '', // 'Érvényes' vagy 'Lejárt'
    warrantyExpiryDate: '', // Dátum, ha Érvényes
    battery: '',
    storage: '',
    condition: '',
    color: '',
    location: '',
    price: '',
    description: ''
  })

  // Kategória kiválasztása
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSelectedSubCategory(null)
  }

  // Alkategória kiválasztása
  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory)
  }

  // Vissza a főkategóriákhoz
  const handleBackToMainCategories = () => {
    setSelectedCategory(null)
    setSelectedSubCategory(null)
  }

  // Kép feltöltés
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    setImages([...images, ...newImages])
  }

  // Elsődleges kép beállítása
  const handleSetPrimaryImage = (index) => {
    setPrimaryImageIndex(index)
  }

  // Kép törlése
  const handleRemoveImage = (index) => {
    if (images[index].preview) {
      URL.revokeObjectURL(images[index].preview)
    }
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0)
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(primaryImageIndex - 1)
    }
  }

  // Form adatok frissítése
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Form törlése és főoldalra navigálás
  const handleCancel = () => {
    // Képek preview URL-jeinek törlése
    images.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setFormData({
      title: '',
      warrantyStatus: '',
      warrantyExpiryDate: '',
      battery: '',
      storage: '',
      condition: '',
      color: '',
      location: '',
      price: '',
      description: ''
    })
    setImages([])
    setSelectedCategory(null)
    setSelectedSubCategory(null)
    setPrimaryImageIndex(0)
    navigate('/')
  }

  // Validáció
  const validateForm = () => {
    if (!selectedCategory) {
      return 'Kérjük, válassz ki egy kategóriát!'
    }
    if (!selectedSubCategory) {
      return 'Kérjük, válassz ki egy alkategóriát!'
    }
    if (images.length === 0) {
      return 'Kérjük, tölts fel legalább egy képet!'
    }
    if (!formData.title || formData.title.trim() === '') {
      return 'Kérjük, add meg a hirdetés címét!'
    }
    if (!formData.price || formData.price.trim() === '') {
      return 'Kérjük, add meg az árat!'
    }
    if (!formData.description || formData.description.trim() === '') {
      return 'Kérjük, add meg a leírást!'
    }
    return null
  }

  // Hirdetés feladása
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Token ellenőrzése - próbáljuk betölteni a context-ből vagy localStorage-ból
    const authToken = token || localStorage.getItem('token')
    if (!authToken) {
      setError('Nincs bejelentkezve. Kérjük, jelentkezz be újra!')
      setTimeout(() => navigate('/login'), 2000)
      return
    }

    // Validáció
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      // FormData létrehozása
      const formDataToSend = new FormData()
      
      // Képek hozzáadása (az elsődleges kép az első helyen)
      const sortedImages = [...images]
      if (primaryImageIndex > 0) {
        const primaryImage = sortedImages.splice(primaryImageIndex, 1)[0]
        sortedImages.unshift(primaryImage)
      }
      
      sortedImages.forEach((image) => {
        formDataToSend.append('images', image.file)
      })

      // Egyéb mezők hozzáadása
      formDataToSend.append('title', formData.title)
      formDataToSend.append('category', selectedCategory.name)
      formDataToSend.append('subCategory', selectedSubCategory)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      if (formData.warrantyStatus) formDataToSend.append('warrantyStatus', formData.warrantyStatus)
      if (formData.warrantyExpiryDate) formDataToSend.append('warrantyExpiryDate', formData.warrantyExpiryDate)
      if (formData.battery) formDataToSend.append('battery', formData.battery)
      if (formData.storage) formDataToSend.append('storage', formData.storage)
      if (formData.condition) formDataToSend.append('condition', formData.condition)
      if (formData.color) formDataToSend.append('color', formData.color)
      if (formData.location) formDataToSend.append('location', formData.location)

      // API hívás
      const response = await fetch(`${API_BASE_URL}/ads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formDataToSend
      })

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('JSON parse hiba:', jsonError)
        throw new Error('A szerver nem megfelelő formátumban válaszolt')
      }

      if (!response.ok) {
        console.error('API hiba válasz:', data)
        console.error('Status code:', response.status)
        throw new Error(data.message || 'Hiba történt a hirdetés létrehozása során')
      }

      if (data.success) {
        // Sikeres hirdetés létrehozás
        setShowSuccessModal(true)
      } else {
        throw new Error(data.message || 'Ismeretlen hiba')
      }
    } catch (error) {
      console.error('Hirdetés létrehozási hiba:', error)
      setError(error.message || 'Hiba történt a hirdetés létrehozása során. Kérjük, próbáld újra.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    // Form reset és főoldalra navigálás
    handleCancel()
  }

  // Kategória kiválasztott pill megtalálása
  const selectedCategoryData = selectedCategory ? mainCategories.find(cat => cat.name === selectedCategory.name) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Navbar />
        <div className="px-4 py-8 max-w-4xl mx-auto">
          {/* Cím */}
          <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-8">
            Új hirdetés létrehozása
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hibaüzenet */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Kategória kiválasztása */}
            <div>
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Kategória kiválasztása</h2>
              
              {/* Kiválasztott kategória pill (ha van) */}
              {selectedCategory && (
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleBackToMainCategories}
                    className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-gray-300 hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </button>
                  <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-2">
                    <img src={selectedCategoryData?.image} alt={selectedCategory.name} className="w-6 h-6 object-contain" />
                    <span className="text-gray-700 font-medium">{selectedCategory.name}</span>
                  </div>
                  {selectedSubCategory && (
                    <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                      <span className="text-gray-700 font-medium">{selectedSubCategory}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Kategória kártyák */}
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-gray-200 p-6">
                {!selectedCategory ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mainCategories.map((category, index) => (
                      <div
                        key={index}
                        onClick={() => handleCategorySelect(category)}
                        className="rounded-xl bg-white/10 backdrop-blur-md border border-gray-200 p-4 hover:bg-gray-100 transition-all cursor-pointer flex flex-col items-center justify-center aspect-square"
                      >
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3"
                        />
                        <span className="text-gray-700 text-sm md:text-base font-medium text-center">
                          {category.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subCategories[selectedCategory.name]?.map((subCat, index) => (
                      <div
                        key={index}
                        onClick={() => handleSubCategorySelect(subCat)}
                        className={`rounded-xl border p-4 hover:bg-gray-100 transition-all cursor-pointer text-center ${
                          selectedSubCategory === subCat
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white/10 backdrop-blur-md border-gray-200'
                        }`}
                      >
                        <span className="text-gray-700 font-medium">{subCat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hirdetés címének megadása */}
            <div>
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Hirdetés címének megadása</h2>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Hirdetés címe"
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Képek feltöltése */}
            <div>
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Képek feltöltése</h2>
              
              {/* Kép feltöltés gomb */}
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mx-auto w-16 h-16 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              {/* Feltöltött képek */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.preview}
                        alt={`Feltöltött kép ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 space-y-2">
                        {/* Elsődleges kép gomb */}
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(index)}
                          className={`w-full py-1.5 rounded-full text-xs font-medium transition-colors ${
                            primaryImageIndex === index
                              ? 'bg-blue-800 text-blue-200'
                              : 'bg-blue-100 text-blue-800'
                          } flex items-center justify-center gap-1`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Elsődleges kép
                        </button>
                        {/* Törlés gomb */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="w-full py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Törlés
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Apple garancia */}
            <div>
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Apple garancia</h2>
              <select
                name="warrantyStatus"
                value={formData.warrantyStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Válassz...</option>
                {warrantyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              
              {/* Ha Érvényes, dátum kiválasztó */}
              {formData.warrantyStatus === 'Érvényes' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apple garancia érvényesség
                  </label>
                  <input
                    type="date"
                    name="warrantyExpiryDate"
                    value={formData.warrantyExpiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Részletek - 3x2 grid */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Akkumulátor kapacitás</label>
                  <input
                    type="text"
                    name="battery"
                    value={formData.battery}
                    onChange={handleInputChange}
                    placeholder="Pl: 89%"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tárhely kapacitás</label>
                  <input
                    type="text"
                    name="storage"
                    value={formData.storage}
                    onChange={handleInputChange}
                    placeholder="Pl: 256 GB"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Állapot</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Válassz...</option>
                    {conditionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bevonat színe</label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Válassz...</option>
                    {Object.keys(appleColors).map((colorName) => (
                      <option key={colorName} value={colorName}>
                        {colorName.charAt(0).toUpperCase() + colorName.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Helyszín</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Pl: Budapest"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ár</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Pl: 225.990 Ft"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Leírás */}
            <div>
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Leírás</h2>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Hirdetés leírása..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Gombok */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Feldolgozás...' : 'Hirdetés feladása'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-8 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mégse
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
      
      {/* Success Modal */}
      {showSuccessModal && <SuccessModal onClose={handleSuccessModalClose} />}
    </div>
  )
}

const CreateAdPage = () => {
  return (
    <ProtectedRoute>
      <CreateAdPageContent />
    </ProtectedRoute>
  )
}

export default CreateAdPage

