const express = require('express')
const Rating = require('../models/Rating')
const Order = require('../models/Order')
const auth = require('../middleware/auth')

const router = express.Router()

// Értékelés létrehozása (védett)
router.post('/', auth, async (req, res) => {
  try {
    const { orderId, rating } = req.body

    if (!orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Rendelés ID és értékelés megadása kötelező'
      })
    }

    if (rating !== 'positive' && rating !== 'negative') {
      return res.status(400).json({
        success: false,
        message: 'Érvényes értékelés megadása kötelező (positive vagy negative)'
      })
    }

    // Rendelés lekérése
    const order = await Order.findById(orderId)
      .populate('buyer', 'fullName email')
      .populate('seller', 'fullName email')

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Rendelés nem található'
      })
    }

    // Csak akkor lehet értékelni, ha a rendelés "received" státuszú
    if (order.status !== 'received') {
      return res.status(400).json({
        success: false,
        message: 'Csak átvett rendelés értékelhető'
      })
    }

    // Ellenőrizzük, hogy a felhasználó részt vett-e a rendelésben
    const isBuyer = order.buyer._id.toString() === req.user.userId
    const isSeller = order.seller._id.toString() === req.user.userId

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultságod ennek a rendelésnek az értékeléséhez'
      })
    }

    // Meghatározzuk, hogy kit értékelünk
    const ratedUserId = isBuyer ? order.seller._id : order.buyer._id

    // Ellenőrizzük, hogy már van-e értékelés
    const existingRating = await Rating.findOne({
      order: orderId,
      rater: req.user.userId
    })

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Már értékelted ezt a rendelést'
      })
    }

    const newRating = new Rating({
      order: orderId,
      rater: req.user.userId,
      rated: ratedUserId,
      rating
    })

    await newRating.save()
    await newRating.populate('rater', 'fullName')
    await newRating.populate('rated', 'fullName')

    res.status(201).json({
      success: true,
      message: 'Értékelés sikeresen létrehozva',
      rating: newRating
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Már értékelted ezt a rendelést'
      })
    }
    console.error('Értékelés létrehozási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az értékelés létrehozása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Értékelés lekérése rendeléshez (védett)
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params

    const rating = await Rating.findOne({
      order: orderId,
      rater: req.user.userId
    })
      .populate('rated', 'fullName')

    res.json({
      success: true,
      rating: rating || null
    })
  } catch (error) {
    console.error('Értékelés lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az értékelés lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Felhasználó értékeléseinek számlálója (publikus)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const positiveCount = await Rating.countDocuments({
      rated: userId,
      rating: 'positive'
    })

    const negativeCount = await Rating.countDocuments({
      rated: userId,
      rating: 'negative'
    })

    res.json({
      success: true,
      positiveCount,
      negativeCount,
      totalCount: positiveCount + negativeCount
    })
  } catch (error) {
    console.error('Értékelések számlálási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az értékelések számlálása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router

