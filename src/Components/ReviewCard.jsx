import { mainCategories } from '../utils/categories'

const ReviewCard = ({ review, showActions = false, onEdit, onDelete }) => {
  if (!review) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))
  }

  // Kategória megtalálása
  const categoryData = review.category ? mainCategories.find(cat => cat.name === review.category) : null

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
      {/* Név vagy Kategória (ha showActions true, akkor kategória) */}
      {showActions && categoryData ? (
        <div className="flex items-center gap-3 mb-2">
          <img 
            src={categoryData.image} 
            alt={categoryData.name} 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {review.category}
            </h3>
            {review.subCategory && (
              <p className="text-sm text-gray-600">{review.subCategory}</p>
            )}
          </div>
        </div>
      ) : (
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {review.user?.fullName || 'Ismeretlen felhasználó'}
        </h3>
      )}
      
      {/* Csillagok */}
      <div className="flex items-center gap-1 mb-3">
        {renderStars(review.rating)}
      </div>
      
      {/* Szöveg */}
      <p className="text-gray-700 italic font-light mb-3">
        {review.text}
      </p>
      
      {/* Dátum */}
      <p className="text-sm text-gray-500">
        {formatDate(review.createdAt)}
      </p>
      
      {/* Szerkesztés és törlés gombok (ha showActions true) */}
      {showActions && (
        <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onEdit(review)}
            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-400 transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Szerkesztés
          </button>
          <button
            onClick={() => onDelete(review._id)}
            className="px-4 py-2 rounded-lg bg-red-200 text-red-800 text-sm font-medium hover:bg-red-300 transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Törlés
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewCard

