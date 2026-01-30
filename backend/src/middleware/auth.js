const jwt = require('jsonwebtoken')
require('dotenv').config()

const authMiddleware = (req, res, next) => {
  try {
    // Token kinyerése a header-ből
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Nincs token megadva vagy érvénytelen formátum' 
      })
    }

    const token = authHeader.substring(7) // "Bearer " eltávolítása

    // Token ellenőrzése
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Felhasználó információ hozzáadása a request-hez
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Érvénytelen token' 
      })
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'A token lejárt' 
      })
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Szerver hiba az autentikáció során' 
    })
  }
}

module.exports = authMiddleware

