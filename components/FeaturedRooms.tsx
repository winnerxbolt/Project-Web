import RoomCard from './RoomCard'

const featuredRooms = [
  {
    id: 1,
    name: 'Deluxe Suite',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2074',
    beds: 2,
    guests: 4,
    size: 45,
    rating: 4.8,
    reviews: 128,
    amenities: ['WiFi', 'TV', 'แอร์', 'มินิบาร์'],
  },
  {
    id: 2,
    name: 'Executive Room',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070',
    beds: 1,
    guests: 2,
    size: 35,
    rating: 4.6,
    reviews: 95,
    amenities: ['WiFi', 'TV', 'แอร์', 'โต๊ะทำงาน'],
  },
  {
    id: 3,
    name: 'Family Room',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070',
    beds: 3,
    guests: 6,
    size: 60,
    rating: 4.9,
    reviews: 156,
    amenities: ['WiFi', 'TV', 'แอร์', 'ครัวขนาด', 'เครื่องซักผ้า'],
  },
  {
    id: 4,
    name: 'Standard Room',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070',
    beds: 1,
    guests: 2,
    size: 25,
    rating: 4.4,
    reviews: 73,
    amenities: ['WiFi', 'TV', 'แอร์'],
  },
]

export default function FeaturedRooms() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ห้องพักแนะนำ</h2>
          <p className="text-xl text-gray-600">ห้องพักคุณภาพที่ได้รับความนิยมสูงสุด</p>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <a
            href="/rooms"
            className="inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
          >
            ดูห้องพักทั้งหมด
          </a>
        </div>
      </div>
    </section>
  )
}
