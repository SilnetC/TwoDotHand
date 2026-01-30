const express = require('express')
const cors = require('cors')
const connectDB = require('./config/database')
require('dotenv').config()

// Route-ok importálása
const authRoutes = require('./routes/auth')
const adsRoutes = require('./routes/ads')
const favoritesRoutes = require('./routes/favorites')
const reviewsRoutes = require('./routes/reviews')
const ordersRoutes = require('./routes/orders')
const ratingsRoutes = require('./routes/ratings')
const savedSearchesRoutes = require('./routes/savedSearches')

// Express app inicializálása
const app = express()

// CORS beállítások - MINDEN route előtt kell lennie
const corsOptions = {
  origin: function (origin, callback) {
    // Fejlesztési környezetben minden origin-t engedélyezünk
    callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))

// JSON parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database kapcsolat
connectDB()

// Request logging middleware (fejlesztési célokra)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
  })
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/ads', adsRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/reviews', reviewsRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/ratings', ratingsRoutes)
app.use('/api/saved-searches', savedSearchesRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint nem található'
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Szerver hiba',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
})

// Server indítás
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`CORS enabled for all origins in development`)
})

module.exports = app

