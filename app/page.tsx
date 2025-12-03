import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import FeaturedRooms from '@/components/FeaturedRooms'
import Features from '@/components/Features'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <FeaturedRooms />
        <Features />
        <Footer />
      </main>
    </ProtectedRoute>
  )
}
