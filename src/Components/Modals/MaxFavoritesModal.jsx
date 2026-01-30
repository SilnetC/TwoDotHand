const MaxFavoritesModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full text-center">
        {/* Narancsárga háromszög figyelmeztetés */}
        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-black mb-4">Maximum elérés</h2>
        <p className="text-lg text-gray-600 mb-8">
          Elérte a maximálisan menthető hirdetések számát (10 darab). Ha új hirdetést szeretne menteni, először távolítsa el egy meglévő mentett hirdetést.
        </p>
        
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer"
        >
          Rendben
        </button>
      </div>
    </div>
  )
}

export default MaxFavoritesModal

