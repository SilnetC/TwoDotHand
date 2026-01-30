const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ad',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true,
    trim: true
  },
  buyerEmail: {
    type: String,
    required: true,
    trim: true
  },
  buyerPhone: {
    type: String,
    required: true,
    trim: true
  },
  shippingMethod: {
    type: String,
    enum: ['Foxpost', 'GLS', 'Posta'],
    required: true
  },
  shippingPointName: {
    type: String,
    trim: true
  },
  shippingPointAddress: {
    type: String,
    trim: true
  },
  productPrice: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 1499
  },
  totalPrice: {
    type: Number,
    required: true
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_transit', 'received', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Order', OrderSchema)

