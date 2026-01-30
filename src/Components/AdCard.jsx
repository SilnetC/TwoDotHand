import { Link, useNavigate } from 'react-router-dom'

const AdCard = ({ ad, onDelete, showActions = true }) => {
  const navigate = useNavigate()
  
  // Elsődleges kép megtalálása
  const primaryImage = ad.images?.find(img => img.isPrimary) || ad.images?.[0]
  const imageUrl = primaryImage?.url || ''

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm('Biztosan törölni szeretnéd ezt a hirdetést?')) {
      onDelete(ad._id)
    }
  }

  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/edit-ad/${ad._id}`)
  }

  return (
    <div className="p-5 rounded-xl bg-gray-200 flex flex-col">
      {/* Elsődleges kép */}
      <img
        src={imageUrl}
        alt={ad.title}
        className="w-full h-48 object-cover rounded-xl mb-4"
      />
      
      {/* Cím */}
      <h3 className="text-lg font-bold text-black mb-4 line-clamp-2">
        {ad.title}
      </h3>
      
      {/* Gombok - csak ha showActions true */}
      {showActions && (
        <div className="mt-auto space-y-2">
          {/* Megtekintés gomb */}
          <Link
            to={`/product/${ad._id}`}
            className="w-full py-2 rounded-full bg-blue-200 text-blue-800 font-medium hover:bg-blue-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Megtekintés
          </Link>
          
          {/* Szerkesztés gomb */}
          <button
            onClick={handleEdit}
            className="w-full py-2 rounded-full bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Szerkesztés
          </button>
          
          {/* Törlés gomb */}
          <button
            onClick={handleDelete}
            className="w-full py-2 rounded-full bg-red-200 text-red-800 font-medium hover:bg-red-300 transition-colors cursor-pointer flex items-center justify-center gap-2"
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

export default AdCard

