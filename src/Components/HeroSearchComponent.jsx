import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mainCategories } from '../utils/categories'

const HeroSearchComponent = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleCategoryClick = (categoryName) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`)
  }

  return (
    <div className="w-full mx-auto px-4 mt-8 mb-8">
      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 p-8 md:p-12 shadow-2xl">
        {/* Főcím */}
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
            onClick={() => navigate('/search')}
            className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 text-white font-medium cursor-pointer"
          >
            {/* Tölcsér ikon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Szűrés
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 text-white font-medium cursor-pointer"
          >
            {/* Nagyító ikon */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Keresés
          </button>
        </form>

        {/* Kategória kártyák - 2 sorban, 6-6 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mainCategories.map((category, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(category.name)}
              className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-4 hover:bg-white/20 transition-all cursor-pointer flex flex-col items-center justify-center aspect-square"
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroSearchComponent