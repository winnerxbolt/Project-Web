'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaUsers, FaPlus, FaMinus, FaCheckCircle } from 'react-icons/fa'
import { useLanguage } from '@/contexts/LanguageContext'

interface Room {
  id: string
  name: string
  type: string
  price: number
  maxGuests: number
}
