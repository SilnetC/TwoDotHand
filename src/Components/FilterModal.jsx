import { useState, useEffect } from 'react'

const FilterModal = ({ isOpen, onClose, onApply, initialFilters = {} }) => {
  const [location, setLocation] = useState(initialFilters.location || '')
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '')

  // Frissítjük a state-et, amikor az initialFilters változik
  useEffect(() => {
    setLocation(initialFilters.location || '')
    setMinPrice(initialFilters.minPrice || '')
    setMaxPrice(initialFilters.maxPrice || '')
  }, [initialFilters])

  if (!isOpen) return null

  const handleApply = () => {
    onApply({
      location: location.trim() || undefined,
      minPrice: minPrice.trim() || undefined,
      maxPrice: maxPrice.trim() || undefined
    })
    onClose()
  }

  const handleReset = () => {
    setLocation('')
    setMinPrice('')
    setMaxPrice('')
    onApply({
      location: undefined,
      minPrice: undefined,
      maxPrice: undefined
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Szűrés</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Település */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Település
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Pl: Budapest"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Minimum ár */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum ár (Ft)
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Pl: 10000"
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Maximum ár */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum ár (Ft)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Pl: 100000"
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Gombok */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Visszaállítás
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Alkalmazás
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilterModal

