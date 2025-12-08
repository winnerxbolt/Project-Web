'use client'

import { FaBolt, FaShieldAlt, FaHeadset, FaPercent } from 'react-icons/fa'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Features() {
  const { t } = useLanguage()
  
  const features = [
    {
      icon: FaBolt,
      title: 'feature.wifi.title',
      description: 'feature.wifi.desc',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: FaShieldAlt,
      title: 'feature.pool.title',
      description: 'feature.pool.desc',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: FaHeadset,
      title: 'feature.service.title',
      description: 'feature.service.desc',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FaPercent,
      title: 'feature.restaurant.title',
      description: 'feature.restaurant.desc',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
          <p className="text-xl text-gray-600">{t('features.subtitle')}</p>
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t(feature.title)}</h3>
                <p className="text-gray-600">{t(feature.description)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
