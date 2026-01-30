const AiSearchComponent = () => {
  return (
    <div className="w-full mx-auto px-4 mt-8 mb-24">
      <div className="rounded-2xl bg-blue-800 p-8 md:p-12 shadow-2xl">
        {/* Főcím */}
        <h1 className="text-blue-300 text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8">
          Nem tudsz dönteni? Írd le az igényeidet és az{' '}
          <span className="text-blue-500">AI Asszisztens</span> megkeresi számodra a legjobb hírdetéseket!
        </h1>

        {/* AI Kereső mező és gomb */}
        <div className="flex flex-col md:flex-row gap-3 justify-center items-center">
          <input
            type="text"
            placeholder="Pl: Számítógép programozáshoz, 16GB RAM, nem régebbi mint 2 év..."
            className="flex-1 max-w-4xl px-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
          />
          <button className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 text-white font-medium cursor-pointer">
            {/* AI ikon - sparkles/magic */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Keresés
          </button>
        </div>
      </div>
    </div>
  )
}

export default AiSearchComponent