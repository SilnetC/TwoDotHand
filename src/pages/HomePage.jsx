import Navbar from '../Components/Navbar'
import HeroSearchComponent from '../Components/HeroSearchComponent'
import AiSearchComponent from '../Components/AiSearchComponent'
import FavoriteItemsComponent from '../Components/FavoriteItemsComponent'
import InfoComponent from '../Components/InfoComponent'
import Footer from '../Components/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Navbar />
        <HeroSearchComponent />
        <AiSearchComponent />
        <FavoriteItemsComponent />
        <InfoComponent />
      </div>
      <Footer />
    </div>
  )
}

export default HomePage

