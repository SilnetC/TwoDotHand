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
import MacStudio from '../assets/HeroImages/MacStudio.png'

// Főkategóriák
export const mainCategories = [
  { name: 'iPhone', image: iPhone },
  { name: 'iPad', image: iPad },
  { name: 'AirPods', image: AirPods },
  { name: 'AirTag', image: AirTag },
  { name: 'Kiegészítők', image: Accessories },
  { name: 'Macbook', image: MacBook },
  { name: 'iMac', image: iMac },
  { name: 'Mac Mini', image: MacMini },
  { name: 'Mac Studio', image: MacStudio },
  { name: 'Kijelzők', image: Displays },
  { name: 'Egyéb', image: Others },
  { name: 'Apple Watch', image: AppleWatch },
]

// Alkategóriák
export const subCategories = {
  iPhone: [
    'iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max', 'iPhone Air',
    'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max', 
    'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
    'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
    'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max', 
    'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max', 
    'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max', 
    'iPhone SE', 'iPhone SE 2020', 'iPhone SE 2022',
    'iPhone X', 'iPhone 8', 'iPhone 8 Plus',
    'iPhone Xs', 'iPhone Xs Max', 'iPhone Xr',
    'iPhone 7', 'iPhone 7 Plus', 
    'iPhone 6s', 'iPhone 6s Plus',
    'iPhone 6', 'iPhone 6 Plus', 
    'iPhone 5s', 'iPhone 5c', 'iPhone 5', 
    'iPhone 4s', 'iPhone 4', 'iPhone 3gs', 'iPhone 3g', 'iPhone 3', 'iPhone 2g'
  ],
  iPad: [
    'iPad 1 (A4)', 'iPad 2 (A5)', 'iPad 3 (A5X)', 'iPad 4 (A6X)', 'iPad 5 (A9)', 'iPad 6 (A10)', 'iPad 7 (A10)', 'iPad 8 (A12)', 'iPad 9 (A13)', 'iPad 10 (A14)', 'iPad 11 (A16)',
    'iPad Mini 1', 'iPad Mini 2 (Retina)', 'iPad Mini 3 (A7)', 'iPad Mini 4 (A8)', 'iPad Mini 5 (A12)', 'iPad Mini 6 (A15)', 'iPad Mini 7 (A17)',
    'iPad Air 1 (A7)', 'iPad Air 2 (A8X)', 'iPad Air 3 (A12)', 'iPad Air 4 (A14)', 'iPad Air 5 (M1)', 'iPad Air 6 (M2)', 'iPad Air 7 (M3)',
    'iPad Pro 1 [9.7"] (A9X)', 'iPad Pro 1 [12.9"] (A9X)', 
    'iPad Pro 2 [10.5"] (A10X)', 'iPad Pro 2 [12.9"] (A10X)', 
    'iPad Pro 3 [11"] (A12X)', 'iPad Pro 3 [12.9"] (A12X)',
    'iPad Pro 4 [11"] (A12Z)', 'iPad Pro 4 [12.9"] (A12Z)',
    'iPad Pro 5 [11"] (M1)', 'iPad Pro 5 [12.9"] (M1)',
    'iPad Pro 6 [11"] (M2)', 'iPad Pro 6 [12.9"] (M2)',
    'iPad Pro 7 [11"] (M4)', 'iPad Pro 7 [12.9"] (M4)',
    'iPad Pro 8 [11"] (M5)', 'iPad Pro 8 [12.9"] (M5)',
  ],
  AirPods: [
    'AirPods 1st', 'AirPods 2nd', 'AirPods 3rd', 'AirPods 4th',
    'AirPods Pro', 'AirPods Pro 2', 'AirPods Pro 3',
    'AirPods Max', 
  ],
  AirTag: ['AirTag'],
  Kiegészítők: ['Töltő', 'Tok', 'Kábel', 'Egyéb'],
  Macbook: ['Macbook 12"', 'MacBook Pro', 'MacBook Air'],
  iMac: ['iMac 24"', 'iMac 27"'],
  'Mac Mini': ['Mac Mini (Intel)', 'Mac Mini (M1)', 'Mac Mini (M2)', 'Mac Mini (M2 Pro)', 'Mac Mini (M4)', 'Mac Mini (M4 Pro)'],
  'Mac Studio': ['Mac Studio'],
  Kijelzők: ['Studio Display', 'Pro Display XDR'],
  Egyéb: ['Egyéb'],
  'Apple Watch': [
    'Apple Watch Series 11', 'Apple Watch Series 10', 'Apple Watch Series 9', 'Apple Watch Series 8',
    'Apple Watch Series 7', 'Apple Watch Series 6', 'Apple Watch Series 5', 'Apple Watch Series 4',
    'Apple Watch Series 3', 'Apple Watch Series 2', 'Apple Watch Series 1', 'Apple Watch', 
    'Apple Watch Ultra', 'Apple Watch Ultra 2', 'Apple Watch Ultra 3', 'Apple Watch SE', 'Apple Watch SE 2 (Gen 2)', 'Apple Watch SE 3 (Gen 3)'
  ]
}
