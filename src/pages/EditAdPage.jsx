import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

// Főkategóriák - kiemeljük a komponensen kívülre, hogy ne változzon
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

const EditAdPageContent = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()
  const fileInputRef = useRef(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAd, setIsLoadingAd] = useState(true)
  const [error, setError] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [originalAd, setOriginalAd] = useState(null)
  const loadedAdIdRef = useRef(null) // Ref, hogy nyomon kövessük, melyik id-t töltöttük be

  // State kezelés
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)
  const [existingImages, setExistingImages] = useState([]) // Meglévő képek (Cloudinary URL-ek)
  const [newImages, setNewImages] = useState([]) // Új képek (File objektumok)
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

  // Hirdetés betöltése - csak akkor, amikor az id változik vagy még nem töltöttük be
  useEffect(() => {
    // Ha már betöltöttük ezt az id-t, ne töltse újra
    if (loadedAdIdRef.current === id && originalAd) {
      return
    }

    setIsLoadingAd(true)
    setError('')
    
    const fetchAd = async () => {
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) {
          setError('Nincs bejelentkezve')
          setIsLoadingAd(false)
          return
        }

        const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        const data = await response.json()

        if (response.ok && data.success && data.ad) {
          const ad = data.ad
          setOriginalAd(ad)
          loadedAdIdRef.current = id // Jelöljük, hogy ezt az id-t betöltöttük

          // Kategória beállítása (nem módosítható)
          const categoryData = mainCategories.find(cat => cat.name === ad.category)
          if (categoryData) {
            setSelectedCategory(categoryData)
            setSelectedSubCategory(ad.subCategory)
          }

          // Meglévő képek betöltése
          if (ad.images && ad.images.length > 0) {
            const imagesWithUrls = ad.images.map((img, idx) => ({
              url: img.url,
              publicId: img.publicId,
              isPrimary: img.isPrimary || idx === 0,
              isExisting: true
            }))
            setExistingImages(imagesWithUrls)
            
            // Elsődleges kép indexének megtalálása
            const primaryIdx = imagesWithUrls.findIndex(img => img.isPrimary)
            if (primaryIdx >= 0) {
              setPrimaryImageIndex(primaryIdx)
            } else {
              setPrimaryImageIndex(0)
            }
          }

          // Form adatok betöltése
          setFormData({
            title: ad.title || '',
            warrantyStatus: ad.warrantyStatus || '',
            warrantyExpiryDate: ad.warrantyExpiryDate ? new Date(ad.warrantyExpiryDate).toISOString().split('T')[0] : '',
            battery: ad.battery || '',
            storage: ad.storage || '',
            condition: ad.condition || '',
            color: ad.color || '',
            location: ad.location || '',
            price: ad.price ? `${parseInt(ad.price).toLocaleString('hu-HU')} Ft` : '',
            description: ad.description || ''
          })
        } else {
          setError(data.message || 'Hiba történt a hirdetés betöltése során')
        }
      } catch (err) {
        console.error('Hirdetés betöltési hiba:', err)
        setError('Hiba történt a hirdetés betöltése során')
      } finally {
        setIsLoadingAd(false)
      }
    }

    if (id) {
      fetchAd()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]) // Csak az id változására reagáljunk, ne a token vagy más változására

  // Új kép feltöltés
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const uploadedImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }))
    setNewImages(prev => [...prev, ...uploadedImages])
    // Reset file input, hogy ugyanazt a fájlt is újra lehessen kiválasztani
    e.target.value = ''
  }

  // Elsődleges kép beállítása (meglévő vagy új képek között)
  const handleSetPrimaryImage = (index, isExisting, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (isExisting) {
      // Meglévő képek között választunk
      setPrimaryImageIndex(index)
    } else {
      // Új képek között választunk - az új képek az existingImages után jönnek
      // A state aktuális értékét használjuk funkcionális frissítéssel
      setExistingImages(currentExisting => {
        const totalExisting = currentExisting.length
        setPrimaryImageIndex(totalExisting + index)
        return currentExisting
      })
    }
  }

  // Kép törlése
  const handleRemoveImage = (index, isExisting, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    if (isExisting) {
      // Meglévő kép törlése
      setExistingImages(prev => {
        const filtered = prev.filter((_, i) => i !== index)
        // Frissítjük az elsődleges kép indexét is
        setPrimaryImageIndex(currentPrimary => {
          if (currentPrimary === index) {
            // Ha a törölt kép volt az elsődleges, az elsőt állítjuk be
            return 0
          } else if (currentPrimary > index) {
            // Ha az elsődleges kép indexe nagyobb volt, csökkentjük
            return currentPrimary - 1
          }
          return currentPrimary
        })
        return filtered
      })
    } else {
      // Új kép törlése
      setNewImages(prev => {
        const image = prev[index]
        if (image?.preview) {
          URL.revokeObjectURL(image.preview)
        }
        const filtered = prev.filter((_, i) => i !== index)
        
        // Az elsődleges kép indexét is frissítjük
        setExistingImages(currentExisting => {
          const totalExisting = currentExisting.length
          const removedIndex = totalExisting + index
          setPrimaryImageIndex(currentPrimary => {
            if (currentPrimary === removedIndex) {
              return 0
            } else if (currentPrimary > removedIndex) {
              return currentPrimary - 1
            }
            return currentPrimary
          })
          return currentExisting
        })
        
        return filtered
      })
    }
  }

  // Form adatok frissítése
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Form megszakítása
  const handleCancel = () => {
    // Új képek preview URL-jeinek törlése
    newImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })
    navigate('/profile')
  }

  // Validáció
  const validateForm = () => {
    // Legalább egy képnek kell lennie (meglévő vagy új)
    const totalImages = existingImages.length + newImages.length
    if (totalImages === 0) {
      return 'Kérjük, legalább egy képnek kell lennie!'
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

  // Hirdetés frissítése
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Token ellenőrzése
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
      
      // Megtartandó meglévő képek publicId-jeinek listája
      const keepImagePublicIds = existingImages.map(img => img.publicId)
      formDataToSend.append('keepImages', JSON.stringify(keepImagePublicIds))
      
      // Elsődleges kép meghatározása
      let primaryImagePublicId = null
      let primaryIsNewImage = false
      let primaryNewImageIndex = -1
      
      if (existingImages.length > 0 && primaryImageIndex < existingImages.length) {
        // Az elsődleges kép meglévő képek közül van
        primaryImagePublicId = existingImages[primaryImageIndex]?.publicId || null
      } else if (newImages.length > 0 && primaryImageIndex >= existingImages.length) {
        // Az elsődleges kép új képek közül van
        primaryIsNewImage = true
        primaryNewImageIndex = primaryImageIndex - existingImages.length
      }
      
      // Ha van elsődleges kép publicId-je (meglévő), elküldjük
      if (primaryImagePublicId) {
        formDataToSend.append('primaryImagePublicId', primaryImagePublicId)
      }
      
      // Ha az elsődleges kép új képek közül van, jelezzük
      if (primaryIsNewImage && primaryNewImageIndex >= 0) {
        formDataToSend.append('primaryIsNewImage', 'true')
        formDataToSend.append('primaryNewImageIndex', primaryNewImageIndex.toString())
      }
      
      // Új képek hozzáadása (sorrendben, ahogy fel lettek töltve)
      if (newImages.length > 0) {
        newImages.forEach((image) => {
          formDataToSend.append('images', image.file)
        })
      }

      // Egyéb mezők hozzáadása
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price)
      if (formData.warrantyStatus) formDataToSend.append('warrantyStatus', formData.warrantyStatus)
      if (formData.warrantyExpiryDate) formDataToSend.append('warrantyExpiryDate', formData.warrantyExpiryDate)
      if (formData.battery) formDataToSend.append('battery', formData.battery)
      if (formData.storage) formDataToSend.append('storage', formData.storage)
      if (formData.condition) formDataToSend.append('condition', formData.condition)
      if (formData.color) formDataToSend.append('color', formData.color)
      if (formData.location) formDataToSend.append('location', formData.location)

      // API hívás - PUT kérés
      const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
        method: 'PUT',
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
        throw new Error(data.message || 'Hiba történt a hirdetés frissítése során')
      }

      if (data.success) {
        // Sikeres frissítés
        setShowSuccessModal(true)
      } else {
        throw new Error(data.message || 'Ismeretlen hiba')
      }
    } catch (error) {
      console.error('Hirdetés frissítési hiba:', error)
      setError(error.message || 'Hiba történt a hirdetés frissítése során. Kérjük, próbáld újra.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate('/profile')
  }

  // Kategória kiválasztott pill megtalálása
  const selectedCategoryData = selectedCategory ? mainCategories.find(cat => cat.name === selectedCategory.name) : null

  // Összes kép (meglévő + új)
  const allImages = [...existingImages, ...newImages.map(img => ({ url: img.preview, isExisting: false }))]

  if (isLoadingAd) {
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

  if (!originalAd) {
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
        <div className="px-4 py-8 max-w-4xl mx-auto">
          {/* Cím */}
          <h1 className="text-3xl md:text-4xl font-bold text-black text-center mb-8">
            Hirdetés szerkesztése
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Hibaüzenet */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Kategória (csak olvasható) */}
            <div>
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Kategória</h2>
              <div className="rounded-xl bg-gray-100 border border-gray-300 p-4">
                <div className="flex items-center gap-2">
                  {selectedCategoryData && (
                    <img src={selectedCategoryData.image} alt={selectedCategory.name} className="w-8 h-8 object-contain" />
                  )}
                  <span className="text-gray-700 font-medium">{selectedCategory?.name || originalAd.category}</span>
                  {selectedSubCategory && (
                    <>
                      <span className="text-gray-500">/</span>
                      <span className="text-gray-700 font-medium">{selectedSubCategory}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">A kategória nem módosítható</p>
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
              <h2 className="text-lg font-semibold text-blue-800 mb-4">Képek</h2>
              
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

              {/* Meglévő és új képek */}
              {(existingImages.length > 0 || newImages.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Meglévő képek */}
                  {existingImages.map((image, index) => {
                    const totalExisting = existingImages.length
                    const isPrimary = primaryImageIndex === index && primaryImageIndex < totalExisting
                    return (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={image.url}
                          alt={`Meglévő kép ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 space-y-2">
                          <button
                            type="button"
                            onClick={(e) => handleSetPrimaryImage(index, true, e)}
                            className={`w-full py-1.5 rounded-full text-xs font-medium transition-colors ${
                              isPrimary
                                ? 'bg-blue-800 text-blue-200'
                                : 'bg-blue-100 text-blue-800'
                            } flex items-center justify-center gap-1`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Elsődleges kép
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveImage(index, true, e)}
                            className="w-full py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Törlés
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {/* Új képek */}
                  {newImages.map((image, index) => {
                    const totalExisting = existingImages.length
                    const isPrimary = primaryImageIndex === totalExisting + index
                    return (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={image.preview}
                          alt={`Új kép ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 space-y-2">
                          <button
                            type="button"
                            onClick={(e) => handleSetPrimaryImage(index, false, e)}
                            className={`w-full py-1.5 rounded-full text-xs font-medium transition-colors ${
                              isPrimary
                                ? 'bg-blue-800 text-blue-200'
                                : 'bg-blue-100 text-blue-800'
                            } flex items-center justify-center gap-1`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Elsődleges kép
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveImage(index, false, e)}
                            className="w-full py-1.5 rounded-full bg-red-100 text-red-800 text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Törlés
                          </button>
                        </div>
                      </div>
                    )
                  })}
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
                {isLoading ? 'Mentés...' : 'Módosítások mentése'}
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
      {showSuccessModal && (
        <SuccessModal 
          onClose={handleSuccessModalClose}
          message="Hirdetés sikeresen frissítve!"
        />
      )}
    </div>
  )
}

const EditAdPage = () => {
  return (
    <ProtectedRoute>
      <EditAdPageContent />
    </ProtectedRoute>
  )
}

export default EditAdPage

