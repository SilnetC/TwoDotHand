const express = require('express')
const Review = require('../models/Review')
const auth = require('../middleware/auth')

const router = express.Router()

// Vélemények lekérése terméktípus szerint (publikus)
router.get('/category/:category/:subCategory', async (req, res) => {
  try {
    const { category, subCategory } = req.params
    
    const reviews = await Review.find({
      category: category,
      subCategory: subCategory
    })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      reviews
    })
  } catch (error) {
    console.error('Vélemények lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a vélemények lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Felhasználó saját véleményeinek lekérése (védett)
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.userId })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      reviews
    })
  } catch (error) {
    console.error('Saját vélemények lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a vélemények lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Új vélemény létrehozása (védett)
router.post('/', auth, async (req, res) => {
  try {
    const { category, subCategory, rating, text } = req.body

    if (!category || !subCategory || !rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Minden mező kitöltése kötelező'
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Az értékelés 1-5 között lehet'
      })
    }

    // Ellenőrizzük, hogy már van-e véleménye ebből a kategóriából
    const existingReview = await Review.findOne({
      user: req.user.userId,
      category: category,
      subCategory: subCategory
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Már írtál véleményt erről a terméktípusról'
      })
    }

    const review = new Review({
      user: req.user.userId,
      category,
      subCategory,
      rating: parseInt(rating),
      text: text.trim()
    })

    await review.save()
    await review.populate('user', 'fullName')

    res.status(201).json({
      success: true,
      message: 'Vélemény sikeresen létrehozva',
      review
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Már írtál véleményt erről a terméktípusról'
      })
    }
    console.error('Vélemény létrehozási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a vélemény létrehozása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Vélemény módosítása (védett)
router.put('/:id', auth, async (req, res) => {
  try {
    const { rating, text } = req.body

    if (!rating || !text) {
      return res.status(400).json({
        success: false,
        message: 'Minden mező kitöltése kötelező'
      })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Az értékelés 1-5 között lehet'
      })
    }

    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Vélemény nem található'
      })
    }

    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultságod ennek a véleménynek a szerkesztéséhez'
      })
    }

    review.rating = parseInt(rating)
    review.text = text.trim()
    await review.save()
    await review.populate('user', 'fullName')

    res.json({
      success: true,
      message: 'Vélemény sikeresen módosítva',
      review
    })
  } catch (error) {
    console.error('Vélemény módosítási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a vélemény módosítása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Vélemény törlése (védett)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Vélemény nem található'
      })
    }

    if (review.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Nincs jogosultságod ennek a véleménynek a törléséhez'
      })
    }

    await Review.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Vélemény sikeresen törölve'
    })
  } catch (error) {
    console.error('Vélemény törlési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a vélemény törlése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router

