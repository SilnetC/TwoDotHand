import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductPage from './pages/ProductPage'
import ProfilePage from './pages/ProfilePage'
import CreateAdPage from './pages/CreateAdPage'
import EditAdPage from './pages/EditAdPage'
import OrderPage from './pages/OrderPage'
import SearchResultsPage from './pages/SearchResultsPage'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/create-ad" element={<CreateAdPage />} />
          <Route path="/edit-ad/:id" element={<EditAdPage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          {/* További útvonalak itt adhatók hozzá */}
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App