const express = require('express')
const auth = require('../middleware/auth')
const SavedSearch = require('../models/SavedSearch')
const Ad = require('../models/Ad')

const router = express.Router()

// Keresés mentése (védett)
router.post('/', auth, async (req, res) => {
  try {
    const { searchParams } = req.body
    const userId = req.user.userId

    if (!searchParams) {
      return res.status(400).json({
        success: false,
        message: 'Keresési paraméterek megadása kötelező'
      })
    }

    // Ellenőrizzük, hogy már létezik-e ugyanaz a keresés
    const existingSearch = await SavedSearch.findOne({
      user: userId,
      'searchParams.query': searchParams.query || null,
      'searchParams.category': searchParams.category || null,
      'searchParams.subCategory': searchParams.subCategory || null,
      'searchParams.location': searchParams.location || null,
      'searchParams.minPrice': searchParams.minPrice || null,
      'searchParams.maxPrice': searchParams.maxPrice || null
    })

    if (existingSearch) {
      return res.status(400).json({
        success: false,
        message: 'Ez a keresés már mentve van'
      })
    }

    const savedSearch = new SavedSearch({
      user: userId,
      searchParams: {
        query: searchParams.query || null,
        category: searchParams.category || null,
        subCategory: searchParams.subCategory || null,
        location: searchParams.location || null,
        minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : null,
        maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : null
      }
    })

    await savedSearch.save()

    res.json({
      success: true,
      message: 'Keresés sikeresen mentve',
      savedSearch
    })
  } catch (error) {
    console.error('Keresés mentési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a keresés mentése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Felhasználó mentett keresései (védett)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId

    const savedSearches = await SavedSearch.find({ user: userId })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      savedSearches
    })
  } catch (error) {
    console.error('Mentett keresések lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a mentett keresések lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Mentett keresés törlése (védett)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const savedSearch = await SavedSearch.findById(id)

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'Mentett keresés nem található'
      })
    }

    if (savedSearch.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultságod ennek a keresésnek a törléséhez'
      })
    }

    await SavedSearch.findByIdAndDelete(id)

    res.json({
      success: true,
      message: 'Mentett keresés sikeresen törölve'
    })
  } catch (error) {
    console.error('Mentett keresés törlési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a mentett keresés törlése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Új hirdetések lekérése mentett kereséshez (védett)
router.get('/:id/new-ads', auth, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const savedSearch = await SavedSearch.findById(id)

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'Mentett keresés nem található'
      })
    }

    if (savedSearch.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultságod ennek a keresésnek a megtekintéséhez'
      })
    }

    const { searchParams, lastChecked } = savedSearch

    // Keresési query összeállítása
    const searchQuery = { status: 'active' }

    // Kulcsszó keresés
    if (searchParams.query && searchParams.query.trim()) {
      const searchRegex = new RegExp(searchParams.query.trim(), 'i')
      searchQuery.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ]
    }

    // Kategória szűrés
    if (searchParams.category && searchParams.category.trim()) {
      searchQuery.category = searchParams.category.trim()
    }

    // Alkategória szűrés
    if (searchParams.subCategory && searchParams.subCategory.trim()) {
      searchQuery.subCategory = searchParams.subCategory.trim()
    }

    // Település szűrés
    if (searchParams.location && searchParams.location.trim()) {
      searchQuery.location = new RegExp(searchParams.location.trim(), 'i')
    }

    // Ár szűrése
    if (searchParams.minPrice || searchParams.maxPrice) {
      searchQuery.price = {}
      if (searchParams.minPrice) {
        searchQuery.price.$gte = searchParams.minPrice
      }
      if (searchParams.maxPrice) {
        searchQuery.price.$lte = searchParams.maxPrice
      }
    }

    // Új hirdetések (a lastChecked után létrehozottak)
    searchQuery.createdAt = { $gt: lastChecked }

    const newAds = await Ad.find(searchQuery)
      .sort({ createdAt: -1 })
      .populate('seller', 'fullName email')

    // Frissítjük a lastChecked-et
    savedSearch.lastChecked = new Date()
    await savedSearch.save()

    res.json({
      success: true,
      newAds,
      count: newAds.length
    })
  } catch (error) {
    console.error('Új hirdetések lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az új hirdetések lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Értesítések száma (védett)
router.get('/notifications/count', auth, async (req, res) => {
  try {
    const userId = req.user.userId

    const savedSearches = await SavedSearch.find({ user: userId })

    let totalNewAds = 0

    for (const savedSearch of savedSearches) {
      const { searchParams, lastChecked } = savedSearch

      const searchQuery = { status: 'active', createdAt: { $gt: lastChecked } }

      // Kulcsszó keresés
      if (searchParams.query && searchParams.query.trim()) {
        const searchRegex = new RegExp(searchParams.query.trim(), 'i')
        searchQuery.$or = [
          { title: searchRegex },
          { description: searchRegex }
        ]
      }

      // Kategória szűrés
      if (searchParams.category && searchParams.category.trim()) {
        searchQuery.category = searchParams.category.trim()
      }

      // Alkategória szűrés
      if (searchParams.subCategory && searchParams.subCategory.trim()) {
        searchQuery.subCategory = searchParams.subCategory.trim()
      }

      // Település szűrés
      if (searchParams.location && searchParams.location.trim()) {
        searchQuery.location = new RegExp(searchParams.location.trim(), 'i')
      }

      // Ár szűrése
      if (searchParams.minPrice || searchParams.maxPrice) {
        searchQuery.price = {}
        if (searchParams.minPrice) {
          searchQuery.price.$gte = searchParams.minPrice
        }
        if (searchParams.maxPrice) {
          searchQuery.price.$lte = searchParams.maxPrice
        }
      }

      const count = await Ad.countDocuments(searchQuery)
      totalNewAds += count
    }

    res.json({
      success: true,
      count: totalNewAds
    })
  } catch (error) {
    console.error('Értesítések számolási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az értesítések számolása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router

