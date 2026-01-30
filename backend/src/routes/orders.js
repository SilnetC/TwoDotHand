const express = require('express')
const Order = require('../models/Order')
const Ad = require('../models/Ad')
const auth = require('../middleware/auth')

const router = express.Router()

// Rendelés létrehozása (védett)
router.post('/', auth, async (req, res) => {
  try {
    const {
      adId,
      buyerEmail,
      buyerPhone,
      shippingMethod,
      shippingPointName,
      shippingPointAddress
    } = req.body

    if (!adId || !buyerEmail || !buyerPhone || !shippingMethod) {
      return res.status(400).json({
        success: false,
        message: 'Minden kötelező mező kitöltése szükséges'
      })
    }

    // Hirdetés lekérése
    const ad = await Ad.findById(adId).populate('seller', 'fullName email phone')
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Hirdetés nem található'
      })
    }

    // Seller ID meghatározása (populated vagy nem)
    const sellerId = ad.seller._id ? ad.seller._id.toString() : ad.seller.toString()

    // Nem lehet saját hirdetést megvenni
    if (sellerId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Nem vásárolhatod meg a saját hirdetésedet'
      })
    }

    const productPrice = parseInt(ad.price) || 0
    const shippingCost = 1499
    const totalPrice = productPrice + shippingCost

    // Várható érkezés: 3 nap múlva
    const expectedDeliveryDate = new Date()
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3)

    // Seller ObjectId meghatározása (populated vagy nem)
    const sellerObjectId = ad.seller._id || ad.seller

    // Buyer neve meghatározása
    const buyerNameValue = req.user.fullName || req.user.name || 'Ismeretlen felhasználó'

    const order = new Order({
      ad: adId,
      buyer: req.user.userId,
      seller: sellerObjectId,
      buyerName: buyerNameValue,
      buyerEmail: buyerEmail.trim(),
      buyerPhone: buyerPhone.trim(),
      shippingMethod,
      shippingPointName: shippingPointName || '',
      shippingPointAddress: shippingPointAddress || '',
      productPrice,
      shippingCost,
      totalPrice,
      expectedDeliveryDate,
      status: 'pending'
    })

    await order.save()
    await order.populate('ad', 'title category price images')
    await order.populate('buyer', 'fullName email')
    await order.populate('seller', 'fullName email')

    res.status(201).json({
      success: true,
      message: 'Rendelés sikeresen leadva',
      order
    })
  } catch (error) {
    console.error('Rendelés létrehozási hiba:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a rendelés létrehozása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Vásárló saját rendelései (védett)
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId })
      .populate('ad', 'title category price images')
      .populate('seller', 'fullName email phone')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Rendelések lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a rendelések lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Eladó saját eladásai (védett)
router.get('/my-sales', auth, async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.userId })
      .populate('ad', 'title category price images')
      .populate('buyer', 'fullName email phone')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      orders
    })
  } catch (error) {
    console.error('Eladások lekérési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az eladások lekérése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Rendelés státusz módosítása (védett - csak eladó)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body

    if (!status || !['pending', 'confirmed', 'in_transit', 'received', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Érvényes státusz megadása kötelező'
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Rendelés nem található'
      })
    }

    // Az eladó módosíthatja 'pending' vagy 'confirmed' státuszt 'in_transit'-re
    // A vásárló módosíthatja 'in_transit' státuszt 'received'-re
    const isSeller = order.seller.toString() === req.user.userId
    const isBuyer = order.buyer.toString() === req.user.userId

    if (status === 'in_transit') {
      // Csak az eladó állíthatja be 'in_transit'-re
      if (!isSeller) {
        return res.status(403).json({
          success: false,
          message: 'Csak az eladó állíthatja be a "Szállítás alatt" státuszt'
        })
      }
      if (order.status !== 'pending' && order.status !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Csak függőben vagy megerősített rendelés állítható "Szállítás alatt" státuszra'
        })
      }
    } else if (status === 'received') {
      // Csak a vásárló állíthatja be 'received'-re
      if (!isBuyer) {
        return res.status(403).json({
          success: false,
          message: 'Csak a vásárló állíthatja be az "Átvéve" státuszt'
        })
      }
      if (order.status !== 'in_transit') {
        return res.status(400).json({
          success: false,
          message: 'Csak "Szállítás alatt" státuszú rendelés állítható "Átvéve" státuszra'
        })
      }
    } else {
      // Egyéb státusz módosítások csak az eladó számára
      if (!isSeller) {
        return res.status(403).json({
          success: false,
          message: 'Nincs jogosultságod ennek a rendelésnek a módosításához'
        })
      }
    }

    order.status = status
    await order.save()

    await order.populate('ad', 'title category price images')
    await order.populate('buyer', 'fullName email')
    await order.populate('seller', 'fullName email')

    res.json({
      success: true,
      message: 'Rendelés státusza sikeresen módosítva',
      order
    })
  } catch (error) {
    console.error('Rendelés státusz módosítási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a rendelés státusz módosítása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Ellenőrzés, hogy egy hirdetés meg van-e rendelve (publikus)
router.get('/check-ad/:adId', async (req, res) => {
  try {
    const { adId } = req.params

    const order = await Order.findOne({
      ad: adId,
      status: { $in: ['pending', 'confirmed', 'in_transit', 'received'] }
    })

    // Ha van rendelés, adjuk vissza, hogy eladva van-e
    if (order) {
      res.json({
        success: true,
        isOrdered: true,
        isSold: order.status === 'received' // Ha received státuszú, akkor eladva
      })
    } else {
      res.json({
        success: true,
        isOrdered: false,
        isSold: false
      })
    }
  } catch (error) {
    console.error('Hirdetés ellenőrzési hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba a hirdetés ellenőrzése során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Új értesítések száma (védett)
router.get('/notifications/count', auth, async (req, res) => {
  try {
    // Függőben lévő eladások száma (eladó)
    const pendingSalesCount = await Order.countDocuments({
      seller: req.user.userId,
      status: 'pending'
    })

    // Szállítás alatt lévő rendelések száma (vásárló) - új státusz
    const inTransitOrdersCount = await Order.countDocuments({
      buyer: req.user.userId,
      status: 'in_transit'
    })

    res.json({
      success: true,
      pendingSales: pendingSalesCount,
      inTransitOrders: inTransitOrdersCount,
      total: pendingSalesCount + inTransitOrdersCount
    })
  } catch (error) {
    console.error('Értesítések számlálási hiba:', error)
    res.status(500).json({
      success: false,
      message: 'Szerver hiba az értesítések számlálása során',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router

