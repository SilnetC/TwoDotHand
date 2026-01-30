const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email cím kötelező'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Érvényes email cím megadása kötelező']
  },
  password: {
    type: String,
    required: [true, 'Jelszó kötelező'],
    minlength: [6, 'A jelszónak legalább 6 karakter hosszúnak kell lennie']
  },
  fullName: {
    type: String,
    required: [true, 'Teljes név kötelező'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Telefonszám kötelező'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Település kötelező'],
    trim: true
  }
}, {
  timestamps: true
})

// Jelszó hash-elése mentés előtt
userSchema.pre('save', async function () {
  // Csak akkor hash-eljük, ha a password módosult vagy új dokumentum
  if (!this.isModified('password')) {
    return
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  } catch (error) {
    throw error
  }
})

// Jelszó ellenőrzés metódus
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Válaszból kizárt mezők
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

const User = mongoose.model('User', userSchema)

module.exports = User

