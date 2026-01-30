const mongoose = require('mongoose')

const AdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A hirdetés címe kötelező']
  },
  category: {
    type: String,
    required: [true, 'A kategória kötelező']
  },
  subCategory: {
    type: String,
    required: [true, 'Az alkategória kötelező']
  },
  description: {
    type: String,
    required: [true, 'A leírás kötelező']
  },
  price: {
    type: Number,
    required: [true, 'Az ár kötelező']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  imei: {
    type: String
  },
  warrantyStatus: {
    type: String,
    enum: ['Érvényes', 'Lejárt'],
    default: null
  },
  warrantyExpiryDate: {
    type: Date,
    default: null
  },
  battery: {
    type: String
  },
  storage: {
    type: String
  },
  condition: {
    type: String
  },
  color: {
    type: String
  },
  location: {
    type: String
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'removed'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Ad', AdSchema)

