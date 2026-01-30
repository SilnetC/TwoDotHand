const express = require('express')
const FavoriteAd = require('../models/FavoriteAd')
const Ad = require('../models/Ad')
const auth = require('../middleware/auth')

const router = express.Router()

// Hirdetés mentése (védett route)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Favorites POST request body:', req.body)
    console.log('User ID:', req.user?.userId)
    
    const { adId } = req.body

    if (!adId) {
      console.error('adId hiányzik a request body-ból')
      return res.status(400).json({
        success: false,
        message: 'Hirdetés ID megadása kötelező'
      })
    }

    // Ellenőrizzük, hogy létezik-e a hirdetés
    const ad = await Ad.findById(adId)
    if (!ad) {
      console.error('Hirdetés nem található ID-vel:', adId)
      return res.status(404).json({
        success: false,
        message: 'Hirdetés nem található'
      })
    }
    
    console.log('Hirdetés megtalálva:', { adId: ad._id, seller: ad.seller, currentUser: req.user.userId })

    // Ellenőrizzük, hogy a felhasználó nem saját hirdetését próbálja elmenteni
    if (ad.seller.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Nem mentheted el a saját hirdetésedet'
      })
    }

    // Ellenőrizzük, hogy hány mentett hirdetése van a felhasználónak
    const favoriteCount = await FavoriteAd.countDocuments({ user: req.user.userId })
    if (favoriteCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'Elérte a maximálisan menthető hirdetések számát (10)'
      })
    }

    // Ellenőrizzük, hogy már elmentette-e
    const existingFavorite = await FavoriteAd.findOne({
      user: req.user.userId,
      ad: adId
    })

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Ez a hirdetés már el van mentve'
      })
    }

    // Mentés létrehozása
    const favorite = new FavoriteAd({
      user: req.user.userId,
      ad: adId
    })

    await favorite.save()

    res.status(201).json({
      success: true,
      message: 'Hirdetés sikeresen mentve',
      favorite
    })
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (egyedi index)
      return res.status(400).json({
        success: false,
        message: 'Ez a hirdetés már el van mentve'
      })
    }
    console.error('Hirdetés mentési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a hirdetés mentése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Felhasználó mentett hirdetéseinek lekérése (védett route)
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await FavoriteAd.find({ user: req.user.userId })
      .populate({
        path: 'ad',
        populate: {
          path: 'seller',
          select: 'fullName email'
        }
      })
      .sort({ createdAt: -1 })

    // Szűrjük ki a törölt vagy nem aktív hirdetéseket
    const activeFavorites = favorites.filter(fav => fav.ad && fav.ad.status === 'active')

    res.json({
      success: true,
      favorites: activeFavorites,
      count: activeFavorites.length
    })
  } catch (error) {
    console.error('Mentett hirdetések lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a mentett hirdetések lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Egy hirdetés mentett státuszának lekérése (védett route)
router.get('/check/:adId', auth, async (req, res) => {
  try {
    const favorite = await FavoriteAd.findOne({
      user: req.user.userId,
      ad: req.params.adId
    })

    res.json({
      success: true,
      isFavorite: !!favorite
    })
  } catch (error) {
    console.error('Mentett státusz lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a mentett státusz lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Hirdetés törlése a mentettek közül (védett route)
router.delete('/:adId', auth, async (req, res) => {
  try {
    const favorite = await FavoriteAd.findOneAndDelete({
      user: req.user.userId,
      ad: req.params.adId
    })

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Mentett hirdetés nem található'
      })
    }

    res.json({
      success: true,
      message: 'Hirdetés sikeresen eltávolítva a mentettek közül'
    })
  } catch (error) {
    console.error('Mentett hirdetés törlési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a mentett hirdetés törlése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router

