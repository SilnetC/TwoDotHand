// Email formátum ellenőrzése
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Telefonszám formátum ellenőrzése (magyar formátumok: +36, 06, stb.)
export const validatePhone = (phone) => {
  if (!phone || phone.trim().length === 0) {
    return false
  }
  
  // Szóközök, kötőjelek és egyéb karakterek eltávolítása
  const cleanedPhone = phone.replace(/[\s-()]/g, '')
  
  // Elfogadja a következő formátumokat:
  // +36 20 123 4567 -> +36201234567 (11 karakter)
  // 06 20 123 4567 -> 06201234567 (11 karakter)
  // 20 123 4567 -> 201234567 (9 karakter)
  // +36 30 123 4567 -> +36301234567
  
  // Egyszerűbb validáció: magyar telefonszám 9-11 számjegy
  // Ha +36-tal vagy 06-tal kezdődik: 11 karakter
  // Ha csak a szám kezdődik 2-9-el: 9 karakter
  if (cleanedPhone.startsWith('+36') || cleanedPhone.startsWith('06')) {
    // +36 vagy 06 formátum: 11 karakter kell legyen
    return /^(\+36|06)[2-9][0-9]{8}$/.test(cleanedPhone)
  } else if (cleanedPhone.startsWith('36')) {
    // 36 formátum (nincs + vagy 0): 11 karakter
    return /^36[2-9][0-9]{8}$/.test(cleanedPhone)
  } else {
    // Rövidebb formátum: csak a szám, 9 karakter
    return /^[2-9][0-9]{8}$/.test(cleanedPhone)
  }
}

// Jelszó egyeztetés ellenőrzése
export const validatePasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword
}

// Jelszó erősség ellenőrzése
export const validatePasswordStrength = (password) => {
  return password.length >= 6
}

