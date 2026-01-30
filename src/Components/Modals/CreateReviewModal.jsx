import { useState } from 'react'
import { mainCategories, subCategories } from '../../utils/categories'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const CreateReviewModal = ({ onClose, onSave, editingReview = null, token }) => {
  // Kategória megtalálása a mainCategories-ból
  const getCategoryByName = (categoryName) => {
    return mainCategories.find(cat => cat.name === categoryName) || null
  }

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (editingReview) {
      return getCategoryByName(editingReview.category)
    }
    return null
  })
  const [selectedSubCategory, setSelectedSubCategory] = useState(editingReview ? editingReview.subCategory : null)
  const [rating, setRating] = useState(editingReview ? editingReview.rating : 0)
  const [text, setText] = useState(editingReview ? editingReview.text : '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStarClick = (starIndex) => {
    setRating(starIndex + 1)
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSelectedSubCategory(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Szerkesztés módban nem kell kategóriát választani
    if (!editingReview && (!selectedCategory || !selectedSubCategory)) {
      setError('Kérjük, válassz kategóriát és alkategóriát')
      return
    }

    if (rating === 0) {
      setError('Kérjük, add meg az értékelést')
      return
    }

    if (!text.trim()) {
      setError('Kérjük, írd le a véleményedet')
      return
    }

    setLoading(true)
    try {
      const reviewData = editingReview
        ? {
            rating,
            text: text.trim()
          }
        : {
            category: selectedCategory.name,
            subCategory: selectedSubCategory,
            rating,
            text: text.trim()
          }
      
      await onSave(reviewData)
      onClose()
    } catch (err) {
      setError(err.message || 'Hiba történt a vélemény mentése során')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type="button"
        onClick={() => handleStarClick(index)}
        className={`w-8 h-8 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400 transition-colors cursor-pointer`}
        disabled={loading}
      >
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    ))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editingReview ? 'Vélemény szerkesztése' : 'Új vélemény írása'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Kategória kiválasztása - csak új véleménynél */}
          {!editingReview && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-blue-800 mb-3">
                  Kategória kiválasztása
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {mainCategories.map((category) => (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      disabled={loading}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedCategory?.name === category.name
                          ? 'border-blue-800 bg-blue-100'
                          : 'border-gray-200 bg-white hover:border-blue-400'
                      }`}
                    >
                      <img src={category.image} alt={category.name} className="w-12 h-12 mx-auto mb-2 object-contain" />
                      <p className="text-xs text-center text-gray-700">{category.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alkategória kiválasztása */}
              {selectedCategory && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-blue-800 mb-3">
                    Alkategória kiválasztása
                  </label>
                  <select
                    value={selectedSubCategory || ''}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Válassz alkategóriát...</option>
                    {subCategories[selectedCategory.name]?.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* Szerkesztés módban kategória megjelenítése */}
          {editingReview && (
            <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Kategória</p>
              <p className="text-lg font-semibold text-gray-800">{editingReview.category}</p>
              <p className="text-sm text-gray-600 mb-1 mt-2">Alkategória</p>
              <p className="text-lg font-semibold text-gray-800">{editingReview.subCategory}</p>
            </div>
          )}

          {/* Értékelés csillagokkal */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Értékelés
            </label>
            <div className="flex items-center gap-2">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-2 text-gray-600 text-sm">({rating}/5)</span>
              )}
            </div>
          </div>

          {/* Vélemény szövege */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Vélemény
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Írd le a véleményedet..."
              rows={6}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Gombok */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-full bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mentés...' : 'Mentés'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateReviewModal

