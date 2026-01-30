const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
require('dotenv').config()

const router = express.Router()

// JWT token generálás
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d' // 7 napig érvényes
  })
}

// Regisztráció
router.post('/register', async (req, res) => {
  try {
    console.log('Regisztrációs kérés érkezett:', req.body)
    const { email, password, confirmPassword, fullName, phone, city } = req.body

    // Validáció
    if (!email || !password || !confirmPassword || !fullName || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Minden mező kitöltése kötelező'
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'A jelszavak nem egyeznek meg'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie'
      })
    }

    // Ellenőrizzük, hogy létezik-e már ilyen email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ez az email cím már regisztrálva van'
      })
    }

    // Új felhasználó létrehozása
    const user = new User({
      email,
      password,
      fullName,
      phone,
      city
    })

    await user.save()

    // JWT token generálása
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'Sikeres regisztráció',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        city: user.city
      }
    })
  } catch (error) {
    console.error('Regisztrációs hiba:', error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ez az email cím már regisztrálva van'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Szerver hiba a regisztráció során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Bejelentkezés
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validáció
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email cím és jelszó megadása kötelező'
      })
    }

    // Felhasználó keresése
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Érvénytelen email cím vagy jelszó'
      })
    }

    // Jelszó ellenőrzése
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Érvénytelen email cím vagy jelszó'
      })
    }

    // JWT token generálása
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Sikeres bejelentkezés',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        city: user.city
      }
    })
  } catch (error) {
    console.error('Bejelentkezési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a bejelentkezés során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Felhasználó adatainak lekérése (védett route)
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        city: user.city
      }
    })
  } catch (error) {
    console.error('Felhasználó lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Telefonszám módosítása (védett route)
router.put('/update-phone', require('../middleware/auth'), async (req, res) => {
  try {
    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Telefonszám megadása kötelező'
      })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      })
    }

    user.phone = phone.trim()
    await user.save()

    res.json({
      success: true,
      message: 'Telefonszám sikeresen módosítva',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        city: user.city
      }
    })
  } catch (error) {
    console.error('Telefonszám módosítási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a telefonszám módosítása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Jelszó módosítása (védett route)
router.put('/update-password', require('../middleware/auth'), async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Minden mező kitöltése kötelező'
      })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Az új jelszavak nem egyeznek meg'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Az új jelszónak legalább 6 karakter hosszúnak kell lennie'
      })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Felhasználó nem található'
      })
    }

    // Jelenlegi jelszó ellenőrzése
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'A jelenlegi jelszó nem megfelelő'
      })
    }

    // Új jelszó beállítása (a pre-save hook automatikusan hash-eli)
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Jelszó sikeresen módosítva'
    })
  } catch (error) {
    console.error('Jelszó módosítási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a jelszó módosítása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router

