const express = require('express')
const multer = require('multer')
const cloudinary = require('../config/cloudinary')
const Ad = require('../models/Ad')
const auth = require('../middleware/auth')

const router = express.Router()

// Multer konfiguráció memóriában tároláshoz
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Cloudinary-ba feltöltés helper függvény
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'twodothand/ads',
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )
    uploadStream.end(file.buffer)
  })
}

// Hirdetés létrehozása (védett route)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      category,
      subCategory,
      description,
      price,
      warrantyStatus,
      warrantyExpiryDate,
      battery,
      storage,
      condition,
      color,
      location
    } = req.body

    // Validáció
    if (!title || !category || !subCategory || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'A cím, kategória, alkategória, leírás és ár megadása kötelező'
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Legalább egy kép feltöltése kötelező'
      })
    }

    // Képek feltöltése Cloudinary-ba (az első kép mindig elsődleges)
    const uploadedImages = []
    try {
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadToCloudinary(req.files[i])
        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          isPrimary: i === 0 // Az első kép (amit a frontend az első helyre tett) elsődleges
        })
      }
    } catch (uploadError) {
      console.error('Cloudinary feltöltési hiba:', uploadError)
      return res.status(500).json({
        success: false,
        message: 'Hiba történt a képek feltöltése során'
      })
    }

    const images = uploadedImages

    // Ár számként konvertálása
    const numericPrice = parseFloat(price.toString().replace(/\s/g, '').replace(/[^\d.]/g, ''))

    // Hirdetés létrehozása
    const ad = new Ad({
      title,
      category,
      subCategory,
      description,
      price: numericPrice,
      warrantyStatus: warrantyStatus || undefined,
      warrantyExpiryDate: warrantyExpiryDate ? new Date(warrantyExpiryDate) : undefined,
      battery: battery || undefined,
      storage: storage || undefined,
      condition: condition || undefined,
      color: color || undefined,
      location: location || undefined,
      images,
      seller: req.user.userId,
      status: 'active'
    })

    await ad.save()

    // Hirdetés betöltése seller adatokkal
    await ad.populate('seller', 'fullName email')

    res.status(201).json({
      success: true,
      message: 'Hirdetés sikeresen létrehozva',
      ad
    })
  } catch (error) {
    console.error('Hirdetés létrehozási hiba:', error)

    // Ha hiba történt, töröljük a feltöltött képeket Cloudinary-ból
    // (Ez egy alapvető cleanup - a pontos public_id-ket a request-ből kellene venni)

    res.status(500).json({
      success: false,
      message: 'Szerver hiba a hirdetés létrehozása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Felhasználó saját hirdetéseinek lekérése (védett route)
router.get('/my-ads', auth, async (req, res) => {
  try {
    const ads = await Ad.find({ seller: req.user.userId })
      .sort({ createdAt: -1 }) // Legfrissebb először
      .populate('seller', 'fullName email')
    
    res.json({
      success: true,
      ads
    })
  } catch (error) {
    console.error('Hirdetések lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a hirdetések lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Keresési endpoint (nyilvános)
router.get('/search', async (req, res) => {
  try {
    const { query, category, subCategory, location, minPrice, maxPrice } = req.query

    // Alap query - csak aktív hirdetések
    const searchQuery = { status: 'active' }

    // Kulcsszó keresés (cím vagy leírás)
    if (query && query.trim()) {
      const searchRegex = new RegExp(query.trim(), 'i') // Case-insensitive keresés
      searchQuery.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ]
    }

    // Kategória szűrés
    if (category && category.trim()) {
      searchQuery.category = category.trim()
    }

    // Alkategória szűrés
    if (subCategory && subCategory.trim()) {
      searchQuery.subCategory = subCategory.trim()
    }

    // Település szűrés
    if (location && location.trim()) {
      searchQuery.location = new RegExp(location.trim(), 'i') // Case-insensitive keresés
    }

    // Ár szűrése
    if (minPrice || maxPrice) {
      searchQuery.price = {}
      if (minPrice) {
        searchQuery.price.$gte = parseInt(minPrice)
      }
      if (maxPrice) {
        searchQuery.price.$lte = parseInt(maxPrice)
      }
    }

    const ads = await Ad.find(searchQuery)
      .sort({ createdAt: -1 }) // Legfrissebb először
      .populate('seller', 'fullName email')
    
    res.json({
      success: true,
      ads,
      count: ads.length
    })
  } catch (error) {
    console.error('Keresési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a keresés során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Összes aktív hirdetés lekérése (nyilvános)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8
    const ads = await Ad.find({ status: 'active' })
      .sort({ createdAt: -1 }) // Legfrissebb először
      .limit(limit)
      .populate('seller', 'fullName email')
    
    res.json({
      success: true,
      ads
    })
  } catch (error) {
    console.error('Hirdetések lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a hirdetések lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Egy hirdetés lekérése ID alapján (nyilvános)
router.get('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate('seller', 'fullName email phone city')
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Hirdetés nem található'
      })
    }
    
    // Megtekintések növelése
    ad.views += 1
    await ad.save()
    
    res.json({
      success: true,
      ad
    })
  } catch (error) {
    console.error('Hirdetés lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a hirdetés lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Hirdetés frissítése (védett route - csak a tulajdonos szerkeszthet)
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Hirdetés nem található'
      })
    }
    
    // Ellenőrizzük, hogy a felhasználó a hirdetés tulajdonosa-e
    if (ad.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultságod a hirdetés szerkesztéséhez'
      })
    }

      const {
      title,
      description,
      price,
      warrantyStatus,
      warrantyExpiryDate,
      battery,
      storage,
      condition,
      color,
      location,
      keepImages, // JSON string: megtartandó meglévő képek publicId-inek listája
      primaryImagePublicId, // Az elsődleges kép publicId-je (ha meglévő kép)
      primaryIsNewImage, // Ha az elsődleges kép új képek közül van
      primaryNewImageIndex // Az elsődleges új kép indexe
    } = req.body

    // Validáció
    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'A cím, leírás és ár megadása kötelező'
      })
    }

    // Képek kezelése
    let finalImages = []
    
    // 1. Meglévő képek megtartása (ha vannak)
    if (keepImages) {
      try {
        const keepImagesArray = JSON.parse(keepImages)
        if (Array.isArray(keepImagesArray) && ad.images && ad.images.length > 0) {
          // Csak azokat a képeket tartjuk meg, amelyek a keepImages listában vannak
          const imagesToKeep = ad.images.filter(img => keepImagesArray.includes(img.publicId))
          finalImages = [...imagesToKeep]
          
          // Töröljük azokat a képeket, amelyeket nem tartunk meg
          const imagesToDelete = ad.images.filter(img => !keepImagesArray.includes(img.publicId))
          for (const image of imagesToDelete) {
            try {
              await cloudinary.uploader.destroy(image.publicId)
            } catch (cloudinaryError) {
              console.error('Cloudinary törlési hiba:', cloudinaryError)
            }
          }
        } else {
          // Ha nincs keepImages vagy hibás, az összes meglévő képet megtartjuk
          finalImages = [...(ad.images || [])]
        }
      } catch (parseError) {
        console.error('keepImages parse hiba:', parseError)
        // Hiba esetén az összes meglévő képet megtartjuk
        finalImages = [...(ad.images || [])]
      }
    } else {
      // Ha nincs keepImages paraméter, az összes meglévő képet megtartjuk
      finalImages = [...(ad.images || [])]
    }
    
    // 2. Új képek hozzáadása
    const newUploadedImages = []
    if (req.files && req.files.length > 0) {
      try {
        for (let i = 0; i < req.files.length; i++) {
          const result = await uploadToCloudinary(req.files[i])
          newUploadedImages.push({
            url: result.secure_url,
            publicId: result.public_id,
            isPrimary: false // Alapból nem elsődleges, majd beállítjuk
          })
        }
        finalImages = [...finalImages, ...newUploadedImages]
      } catch (uploadError) {
        console.error('Cloudinary feltöltési hiba:', uploadError)
        return res.status(500).json({
          success: false,
          message: 'Hiba történt a képek feltöltése során'
        })
      }
    }
    
    // 3. Elsődleges kép beállítása
    if (finalImages.length > 0) {
      // Minden képet nem elsődlegesnek jelölünk
      finalImages.forEach(img => {
        img.isPrimary = false
      })
      
      let primaryImageIndex = -1
      
      // Először ellenőrizzük, hogy van-e primaryImagePublicId (meglévő kép)
      if (primaryImagePublicId) {
        primaryImageIndex = finalImages.findIndex(img => img.publicId === primaryImagePublicId)
      }
      
      // Ha nincs meglévő elsődleges kép, de az elsődleges kép új képek közül van
      if (primaryImageIndex < 0 && primaryIsNewImage === 'true' && primaryNewImageIndex) {
        const newImageIndex = parseInt(primaryNewImageIndex)
        // Az új képek a finalImages végén vannak, a meglévő képek után
        const existingImagesCount = finalImages.length - newUploadedImages.length
        primaryImageIndex = existingImagesCount + newImageIndex
      }
      
      // Ha találtunk elsődleges képet, beállítjuk
      if (primaryImageIndex >= 0 && primaryImageIndex < finalImages.length) {
        finalImages[primaryImageIndex].isPrimary = true
      } else {
        // Ha nem találtunk, az első képet állítjuk elsődlegesnek
        finalImages[0].isPrimary = true
      }
    }
    
    ad.images = finalImages

    // Ár számként konvertálása
    const numericPrice = parseFloat(price.toString().replace(/\s/g, '').replace(/[^\d.]/g, ''))

    // Adatok frissítése
    ad.title = title
    ad.description = description
    ad.price = numericPrice
    ad.warrantyStatus = warrantyStatus || undefined
    ad.warrantyExpiryDate = warrantyExpiryDate ? new Date(warrantyExpiryDate) : undefined
    ad.battery = battery || undefined
    ad.storage = storage || undefined
    ad.condition = condition || undefined
    ad.color = color || undefined
    ad.location = location || undefined

    await ad.save()

    // Hirdetés betöltése seller adatokkal
    await ad.populate('seller', 'fullName email')

    res.json({
      success: true,
      message: 'Hirdetés sikeresen frissítve',
      ad
    })
  } catch (error) {
    console.error('Hirdetés frissítési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a hirdetés frissítése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Hirdetés törlése (védett route - csak a tulajdonos törölhet)
router.delete('/:id', auth, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
    
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Hirdetés nem található'
      })
    }
    
    // Ellenőrizzük, hogy a felhasználó a hirdetés tulajdonosa-e
    if (ad.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultságod a hirdetés törléséhez'
      })
    }
    
    // Képek törlése Cloudinary-ból
    if (ad.images && ad.images.length > 0) {
      for (const image of ad.images) {
        try {
          await cloudinary.uploader.destroy(image.publicId)
        } catch (cloudinaryError) {
          console.error('Cloudinary törlési hiba:', cloudinaryError)
        }
      }
    }
    
    // Hirdetés törlése
    await ad.deleteOne()
    
    res.json({
      success: true,
      message: 'Hirdetés sikeresen törölve'
    })
  } catch (error) {
    console.error('Hirdetés törlési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a hirdetés törlése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router

