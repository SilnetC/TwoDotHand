const appleDetailedCo2Footprint = {
  // Hordozható eszközök és kiegészítők
  "AirPods": 14,         // Átlag a sima (8-10kg) és a Max (40kg+) modellek között
  "AirTag": 5,           // Nagyon alacsony anyagigény
  "Apple Tokok": 7,      // Szilikon és szövet tokok átlaga
  "Apple Watch": 28,     // Series (alacsony) és Ultra (magasabb) modellek átlaga
  "iPhone": 64,
  "iPad": 104,

  // Mac számítógépek
  "MacBook": 215,        // MacBook Air (~150kg) és MacBook Pro (~280kg) vegyesen
  "iMac": 350,           // 24" iMac és korábbi modellek átlaga
  "Mac mini": 120,       // Kiemelkedően hatékony asztali gép
  "Mac Studio": 290,     // Magas teljesítményű chipek miatti magasabb érték

  // Megjelenítők
  "Apple Display": 610,  // Studio Display (~490kg) és Pro Display XDR (~970kg) átlaga

  // Egyéb otthoni eszközök
  "Egyéb": 62            // Apple TV 4K (~46kg), HomePod (~92kg) és HomePod mini (~48kg) átlaga
}

// Kategória nevek mapping az adatszerkezethez
export const getCo2Footprint = (category) => {
  // Kategória név normalizálása
  const normalizedCategory = category?.trim() || ''
  
  // Direkt egyezés
  if (appleDetailedCo2Footprint[normalizedCategory]) {
    return appleDetailedCo2Footprint[normalizedCategory]
  }
  
  // Mapping a kategória nevekre
  const categoryMapping = {
    'AirPods': 'AirPods',
    'AirTag': 'AirTag',
    'iPad': 'iPad',
    'iPhone': 'iPhone',
    'Kiegészítők': 'Apple Tokok', // Kiegészítők kategóriához a tokok CO2-ét használjuk
    'Apple Watch': 'Apple Watch',
    'Macbook': 'MacBook',
    'iMac': 'iMac',
    'Mac Mini': 'Mac mini',
    'Mac Studio': 'Mac Studio',
    'Kijelzők': 'Apple Display',
    'Egyéb': 'Egyéb'
  }
  
  const mappedCategory = categoryMapping[normalizedCategory]
  if (mappedCategory && appleDetailedCo2Footprint[mappedCategory]) {
    return appleDetailedCo2Footprint[mappedCategory]
  }
  
  // Ha nincs egyezés, visszatérünk az alapértelmezett értékkel
  return null
}

export default appleDetailedCo2Footprint

