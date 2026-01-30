const InfoComponent = () => {
  const cards = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Beépített Chat',
      description: 'Ha kérdésed van egy hirdetéssel kapcsolatban, könnyedén választ kaphatsz a beépített chat funkció segítségével.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Apple Garancia',
      description: 'Minden hirdetés esetén feltüntetjük, hogy a készülék rendelkezik-e hivatalos Apple garanciával.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Ai hirdetés optimalizálás',
      description: 'Hirdetés feladás esetén az Ai asszisztens javaslatokkal segít, hogy a lehető leggyorsabban eladhasd a terméket.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Ai asszisztens',
      description: 'Ha nem tudsz választani, akkor csak írd le az igényeidet és az asszisztens megkeresi a számodra legjobb hirdetéseket.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Carbon Report',
      description: 'Vásárláskor a hirdetésnél feltüntetett mértékben vásárolhatsz Carbon kompenzációt, így csökkentheted az ökológiai lábnyomodat.'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Ár grafikon',
      description: 'Hirdetésenként láthatod az adott termék árát az elmúlt 30 napban, így biztos lehetsz benne, hogy a lehető legjobb áron vásárolsz.'
    }
  ]

  return (
    <div className="container mx-auto px-4 mt-8 mb-24">
      {/* Cím */}
      <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-8">
        Miért válaszz minket?
      </h2>

      {/* Leírás */}
      <p className="text-base md:text-lg text-black font-light text-center mb-12 max-w-4xl mx-auto">
        A <span className="font-bold text-blue-800">TwoDotHand</span> több mint egy átlagos marketplace. A platformunk célja, hogy könnyen, gyorsan és környezettudatosan vásárolhass használt Apple eszközöket. Ezzel nem csak magadon segítesz hanem a bolygón is.
      </p>

      {/* Kártyák grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-300 p-6 flex flex-col items-center text-center transition-transform duration-300 hover:scale-105 cursor-pointer"
          >
            {/* Ikon négyzet háttéren */}
            <div className="w-16 h-16 rounded-lg bg-blue-200 flex items-center justify-center mb-4 text-blue-700">
              {card.icon}
            </div>

            {/* Cím */}
            <h3 className="text-xl font-bold text-black mb-3">
              {card.title}
            </h3>

            {/* Leírás */}
            <p className="text-sm md:text-base text-black font-light">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA szekció */}
      <div className="text-center max-w-4xl mx-auto mt-24">
        {/* Főcím */}
        <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
          Csatlakozz a megoldáshoz még ma!
        </h3>

        {/* Leírás */}
        <p className="text-base md:text-lg text-black font-light mb-8">
          Vásárolj vagy adj el valamilyen Apple terméket a TwoDotHand-en és segíts, hogy csökkenthessük az elektronikai hulladékot és együtt egy szebb világot építhessünk!
        </p>

        {/* Gombok */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="px-8 py-3 rounded-full bg-blue-200 text-blue-800 font-medium hover:bg-blue-300 transition-colors cursor-pointer w-full sm:w-auto">
            Néz körül nálunk
          </button>
          <button className="px-8 py-3 rounded-full bg-blue-800 text-blue-200 font-medium hover:bg-blue-900 transition-colors cursor-pointer w-full sm:w-auto">
            Add el régi Apple eszközödet
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoComponent

