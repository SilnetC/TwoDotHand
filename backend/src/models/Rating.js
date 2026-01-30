const mongoose = require('mongoose')

const RatingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: String,
    enum: ['positive', 'negative'],
    required: true
  }
}, {
  timestamps: true
})

// Egyedi index: egy felhasználó csak egyszer értékelhet egy rendeléshez
RatingSchema.index({ order: 1, rater: 1 }, { unique: true })

module.exports = mongoose.model('Rating', RatingSchema)

