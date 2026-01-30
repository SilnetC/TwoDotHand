const mongoose = require('mongoose')

const FavoriteAdSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  }
}, {
  timestamps: true
})

// Egyedi index: egy felhasználó csak egyszer mentheti el ugyanazt a hirdetést
FavoriteAdSchema.index({ user: 1, ad: 1 }, { unique: true })

module.exports = mongoose.model('FavoriteAd', FavoriteAdSchema)

