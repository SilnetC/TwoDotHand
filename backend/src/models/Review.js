const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
})

// Egyedi index: egy felhasználó csak egyszer írhat véleményt egy kategória+alkategória kombinációhoz
ReviewSchema.index({ user: 1, category: 1, subCategory: 1 }, { unique: true })

module.exports = mongoose.model('Review', ReviewSchema)

