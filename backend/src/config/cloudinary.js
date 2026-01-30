const cloudinary = require('cloudinary').v2
require('dotenv').config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'diqycazcw',
  api_key: process.env.CLOUDINARY_API_KEY || '362586546822372',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'd-ykOQGQZCumHruqCIARhKkj2ws'
})

module.exports = cloudinary

