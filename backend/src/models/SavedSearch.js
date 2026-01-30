const mongoose = require('mongoose')

const savedSearchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  searchParams: {
    query: { type: String, default: null },
    category: { type: String, default: null },
    subCategory: { type: String, default: null },
    location: { type: String, default: null },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null }
  },
  lastChecked: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Index a felhasználóra és a létrehozás időpontjára
savedSearchSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('SavedSearch', savedSearchSchema)

