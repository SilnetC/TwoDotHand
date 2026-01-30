# TwoDotHand Backend

Node.js backend API MongoDB Atlas-szal és JWT autentikációval.

## Telepítés

```bash
npm install
```

## Környezeti változók

Hozd létre a `.env` fájlt a következő változókkal:

```env
MONGODB_URI=mongodb+srv://DbUser:LZbgXAi1c5YtQ3B7@cluster0.hkpeeri.mongodb.net/twodothand?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Futtatás

### Fejlesztési mód (nodemon)
```bash
npm run dev
```

### Produkciós mód
```bash
npm start
```

A szerver a `http://localhost:5000` címen fog futni.

## API Endpoints

### Autentikáció

- `POST /api/auth/register` - Regisztráció
- `POST /api/auth/login` - Bejelentkezés
- `GET /api/auth/me` - Felhasználó adatainak lekérése (védett)

### Health Check

- `GET /api/health` - Szerver állapot ellenőrzése

## JWT Token

A bejelentkezés és regisztráció után egy JWT token kerül visszaadásra, amit a `Authorization: Bearer <token>` header-ben kell elküldeni a védett endpointokhoz.

