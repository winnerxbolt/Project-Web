import { FaBolt, FaShieldAlt, FaHeadset, FaPercent } from 'react-icons/fa'

export default function Features() {
  const features = [
    {
      icon: FaBolt,
      title: 'จองง่าย รวดเร็ว',
      description: 'ระบบจองออนไลน์ที่ใช้งานง่าย ได้รับการยืนยันทันที',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: FaShieldAlt,
      title: 'ปลอดภัย มั่นใจ',
      description: 'ระบบชำระเงินที่ปลอดภัย มีการเข้ารหัสข้อมูล',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: FaHeadset,
      title: 'บริการ 24/7',
      description: 'ทีมงานพร้อมให้บริการตลอด 24 ชั่วโมง',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FaPercent,
      title: 'ราคาดีที่สุด',
      description: 'รับประกันราคาที่ดีที่สุด พร้อมโปรโมชั่นพิเศษ',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">ทำไมต้องเลือกเรา</h2>
          <p className="text-xl text-gray-600">บริการที่เหนือกว่าด้วยระบบที่ทันสมัย</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="text-center p-8 rounded-xl hover:shadow-xl transition duration-300"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-full mb-6`}>
                  <Icon className={`text-3xl ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
