import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import Card from '../Components/Card'
import FilterModal from '../Components/FilterModal'
import { mainCategories, subCategories } from '../utils/categories'
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

const categoryImages = {
  iPhone,
  iPad,
  AirPods,
  AirTag,
  'Kiegészítők': Accessories,
  Macbook: MacBook,
  iMac,
  'Mac Mini': MacMini,
  'Mac Studio': MacBook,
  Kijelzők: Displays,
  Egyéb: Others,
  'Apple Watch': AppleWatch
}

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  
  const [ads, setAds] = useState([])
  const [filteredAds, setFilteredAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null)
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('subCategory') || null)
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  })
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'price-low', 'price-high'
  const [isSavedSearch, setIsSavedSearch] = useState(false)
  const [savingSearch, setSavingSearch] = useState(false)

  // Keresés végrehajtása
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams()
        
        if (searchQuery.trim()) {
          params.append('query', searchQuery.trim())
        }
        if (selectedCategory) {
          params.append('category', selectedCategory)
        }
        if (selectedSubCategory) {
          params.append('subCategory', selectedSubCategory)
        }
        if (filters.location) {
          params.append('location', filters.location)
        }
        if (filters.minPrice) {
          params.append('minPrice', filters.minPrice)
        }
        if (filters.maxPrice) {
          params.append('maxPrice', filters.maxPrice)
        }

        const response = await fetch(`${API_BASE_URL}/ads/search?${params.toString()}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setAds(data.ads || [])
        } else {
          setError(data.message || 'Hiba történt a keresés során')
          setAds([])
        }
      } catch (err) {
        console.error('Keresési hiba:', err)
        setError('Hiba történt a keresés során')
        setAds([])
      } finally {
        setLoading(false)
      }
    }

    performSearch()
    checkIfSearchIsSaved()
  }, [searchQuery, selectedCategory, selectedSubCategory, filters, isAuthenticated, token])

  // Rendezés alkalmazása
  useEffect(() => {
    const sortedAds = [...ads]
    
    switch (sortBy) {
      case 'price-low':
        sortedAds.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        sortedAds.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'newest':
      default:
        sortedAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }
    
    setFilteredAds(sortedAds)
  }, [ads, sortBy])

  // Ellenőrizzük, hogy a keresés már mentett-e
  useEffect(() => {
    if (isAuthenticated && token && (searchQuery || selectedCategory || selectedSubCategory || filters.location || filters.minPrice || filters.maxPrice)) {
      checkIfSearchIsSaved()
    }
  }, [isAuthenticated, token, searchQuery, selectedCategory, selectedSubCategory, filters])

  const checkIfSearchIsSaved = async () => {
    if (!isAuthenticated || !token) {
      setIsSavedSearch(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/saved-searches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()

      if (response.ok && data.success) {
        const currentSearchParams = {
          query: searchQuery.trim() || null,
          category: selectedCategory || null,
          subCategory: selectedSubCategory || null,
          location: filters.location || null,
          minPrice: filters.minPrice || null,
          maxPrice: filters.maxPrice || null
        }

        const isSaved = data.savedSearches.some(savedSearch => {
          const params = savedSearch.searchParams
          return (
            (params.query || null) === currentSearchParams.query &&
            (params.category || null) === currentSearchParams.category &&
            (params.subCategory || null) === currentSearchParams.subCategory &&
            (params.location || null) === currentSearchParams.location &&
            (params.minPrice || null) === currentSearchParams.minPrice &&
            (params.maxPrice || null) === currentSearchParams.maxPrice
          )
        })

        setIsSavedSearch(isSaved)
      }
    } catch (error) {
      console.error('Hiba a mentett keresés ellenőrzésekor:', error)
    }
  }

  const handleSaveSearch = async () => {
    if (!isAuthenticated || !token) {
      navigate('/login')
      return
    }

    if (isSavedSearch) {
      return
    }

    setSavingSearch(true)
    try {
      const searchParams = {
        query: searchQuery.trim() || null,
        category: selectedCategory || null,
        subCategory: selectedSubCategory || null,
        location: filters.location || null,
        minPrice: filters.minPrice || null,
        maxPrice: filters.maxPrice || null
      }

      const response = await fetch(`${API_BASE_URL}/saved-searches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ searchParams })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSavedSearch(true)
      } else {
        alert(data.message || 'Hiba történt a keresés mentése során')
      }
    } catch (error) {
      console.error('Hiba a keresés mentésekor:', error)
      alert('Hiba történt a keresés mentése során')
    } finally {
      setSavingSearch(false)
    }
  }

  // URL paraméterek frissítése
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    }
    if (selectedCategory) {
      params.set('category', selectedCategory)
    }
    if (selectedSubCategory) {
      params.set('subCategory', selectedSubCategory)
    }
    if (filters.location) {
      params.set('location', filters.location)
    }
    if (filters.minPrice) {
      params.set('minPrice', filters.minPrice)
    }
    if (filters.maxPrice) {
      params.set('maxPrice', filters.maxPrice)
    }

    setSearchParams(params, { replace: true })
  }, [searchQuery, selectedCategory, selectedSubCategory, filters, setSearchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    // A keresés automatikusan fut, amikor a searchQuery változik
  }

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters)
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSelectedSubCategory(null)
    setSearchQuery('') // Kategória választásnál töröljük a keresőszöveget
  }

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory)
    setSearchQuery('') // Alkategória választásnál töröljük a keresőszöveget
  }

  const handleBackToMainCategories = () => {
    setSelectedCategory(null)
    setSelectedSubCategory(null)
    setSearchQuery('')
  }

  const currentCategoryData = selectedCategory ? mainCategories.find(cat => cat.name === selectedCategory) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Navbar />
        
        {/* Kereső komponens */}
        <div className="w-full mx-auto px-4 mt-8 mb-8">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 p-8 md:p-12 shadow-2xl">
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">
              Találd meg a következő használt Apple eszközöd a legjobb áron
            </h1>

            {/* Kereső mező és gombok */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-8 justify-center items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Keresés..."
                className="flex-1 max-w-2xl px-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowFilterModal(true)}
                className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 text-white font-medium cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Szűrés
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 text-white font-medium cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Keresés
              </button>
              {isAuthenticated && (searchQuery || selectedCategory || selectedSubCategory || filters.location || filters.minPrice || filters.maxPrice) && (
                <button
                  type="button"
                  onClick={handleSaveSearch}
                  disabled={isSavedSearch || savingSearch}
                  className={`px-6 py-3 rounded-full backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 text-white font-medium cursor-pointer ${
                    isSavedSearch || savingSearch
                      ? 'bg-white/5 cursor-not-allowed opacity-50'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z"/>
                  </svg>
                  {savingSearch ? 'Mentés...' : isSavedSearch ? 'Mentve' : 'Keresés Mentése'}
                </button>
              )}
            </form>

            {/* Breadcrumb */}
            {(selectedCategory || selectedSubCategory) && (
              <div className="mb-6 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={handleBackToMainCategories}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 text-white font-medium cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Összes kategória
                </button>
                {selectedCategory && (
                  <span className="text-white/80">›</span>
                )}
                {selectedCategory && (
                  <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium">
                    {selectedCategory}
                  </span>
                )}
                {selectedSubCategory && (
                  <>
                    <span className="text-white/80">›</span>
                    <span className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium">
                      {selectedSubCategory}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Kategória kártyák */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {selectedCategory ? (
                // Alkategóriák megjelenítése
                subCategories[selectedCategory]?.map((subCategory, index) => (
                  <div
                    key={index}
                    onClick={() => handleSubCategorySelect(subCategory)}
                    className={`rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 hover:bg-white/20 transition-all cursor-pointer flex flex-col items-center justify-center aspect-square ${
                      selectedSubCategory === subCategory ? 'bg-white/30 ring-2 ring-white' : ''
                    }`}
                  >
                    <img
                      src={currentCategoryData?.image}
                      alt={subCategory}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3 opacity-70"
                    />
                    <span className="text-white text-sm md:text-base font-medium text-center">
                      {subCategory}
                    </span>
                  </div>
                ))
              ) : (
                // Főkategóriák megjelenítése
                mainCategories.map((category, index) => (
                  <div
                    key={index}
                    onClick={() => handleCategorySelect(category.name)}
                    className={`rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 hover:bg-white/20 transition-all cursor-pointer flex flex-col items-center justify-center aspect-square ${
                      selectedCategory === category.name ? 'bg-white/30 ring-2 ring-white' : ''
                    }`}
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3"
                    />
                    <span className="text-white text-sm md:text-base font-medium text-center">
                      {category.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Találatok */}
        <div className="px-4 mb-8">
          {/* Találatok felirat és rendezés */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-black text-center md:text-left">
              Találatok
            </h2>
            {!loading && !error && filteredAds.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="text-gray-700 font-medium">Rendezés:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="newest">Legfrissebb</option>
                  <option value="price-low">Legolcsóbb</option>
                  <option value="price-high">Legdrágább</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Keresés...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchQuery || selectedCategory || selectedSubCategory
                  ? 'Nem található hirdetés a megadott feltételek szerint.'
                  : 'Nincs keresési feltétel megadva.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-700 text-lg">
                  Találatok száma: <span className="font-bold">{filteredAds.length}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAds.map((ad) => (
                  <Card key={ad._id} ad={ad} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      <Footer />
      
      {/* Szűrő modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
      />
    </div>
  )
}

export default SearchResultsPage

