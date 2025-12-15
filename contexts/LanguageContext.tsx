'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'th' | 'en' | 'cn' | 'ru' | 'kr'
type Currency = 'THB' | 'USD' | 'CNY' | 'RUB' | 'KRW'

interface LanguageContextType {
  language: Language
  currency: Currency
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  formatPrice: (price: number) => string
  convertPrice: (price: number) => number
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Exchange rates (THB as base)
const exchangeRates = {
  THB: 1,
  USD: 0.029,  // 1 THB = 0.029 USD
  CNY: 0.21,   // 1 THB = 0.21 CNY
  RUB: 2.75,   // 1 THB = 2.75 RUB
  KRW: 38.5,   // 1 THB = 38.5 KRW
}

// Currency symbols
const currencySymbols = {
  THB: '฿',
  USD: '$',
  CNY: '¥',
  RUB: '₽',
  KRW: '₩',
}

// Translations
const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navigation
    'nav.home': 'หน้าแรก',
    'nav.rooms': 'ห้องพัก',
    'nav.reviews': 'รีวิว',
    'nav.about': 'เกี่ยวกับเรา',
    'nav.contact': 'ติดต่อ',
    'nav.login': 'เข้าสู่ระบบ',
    'nav.register': 'สมัครสมาชิก',
    'nav.account': 'บัญชี',
    'nav.admin': 'จัดการ',
    'nav.logout': 'ออกจากระบบ',

    // Hero Section
    'hero.title': 'ยินดีต้อนรับสู่โรงแรมของเรา',
    'hero.subtitle': 'สัมผัสประสบการณ์พักผ่อนสุดหรูในบรรยากาศที่เงียบสงบ',
    'hero.cta': 'จองเลย',
    'hero.learn': 'เรียนรู้เพิ่มเติม',

    // Features
    'features.title': 'ฟีเจอร์พิเศษ',
    'features.subtitle': 'สิ่งที่ทำให้เราแตกต่าง',
    'feature.wifi.title': 'Wi-Fi ความเร็วสูง',
    'feature.wifi.desc': 'Wi-Fi ฟรี ความเร็วสูงทุกพื้นที่',
    'feature.pool.title': 'สระว่ายน้ำ',
    'feature.pool.desc': 'สระว่ายน้ำกลางแจ้งและในร่ม',
    'feature.spa.title': 'สปาและฟิตเนส',
    'feature.spa.desc': 'ผ่อนคลายกับบริการสปาระดับโลก',
    'feature.restaurant.title': 'ร้านอาหาร',
    'feature.restaurant.desc': 'อาหารนานาชาติและท้องถิ่น',
    'feature.parking.title': 'ที่จอดรถ',
    'feature.parking.desc': 'ที่จอดรถฟรีสำหรับแขก',
    'feature.service.title': 'บริการ 24 ชั่วโมง',
    'feature.service.desc': 'เราพร้อมให้บริการตลอด 24 ชั่วโมง',

    // Rooms
    'rooms.title': 'ห้องพักของเรา',
    'rooms.featured': 'ห้องพักแนะนำ',
    'rooms.view': 'ดูห้องพัก',
    'rooms.book': 'จองเลย',
    'rooms.pernight': '/คืน',
    'rooms.guests': 'ผู้เข้าพัก',
    'rooms.checkin': 'เช็คอิน',
    'rooms.checkout': 'เช็คเอาท์',
    'rooms.details': 'รายละเอียด',
    'rooms.amenities': 'สิ่งอำนวยความสะดวก',

    // Reviews
    'reviews.title': 'รีวิวจากลูกค้า',
    'reviews.subtitle': 'ความคิดเห็นจากผู้ที่พักกับเรา',
    'reviews.write': 'เขียนรีวิว',
    'reviews.all': 'รีวิวทั้งหมด',
    'reviews.rating': 'คะแนน',
    'reviews.verified': 'ยืนยันแล้ว',

    // About
    'about.title': 'เกี่ยวกับเรา',
    'about.subtitle': 'ประวัติความเป็นมาของโรงแรม',
    'about.description': 'เราคือโรงแรมชั้นนำที่มุ่งมั่นให้บริการที่ดีที่สุด',

    // Contact
    'contact.title': 'ติดต่อเรา',
    'contact.subtitle': 'เรายินดีรับฟังจากคุณ',
    'contact.name': 'ชื่อ',
    'contact.email': 'อีเมล',
    'contact.message': 'ข้อความ',
    'contact.send': 'ส่งข้อความ',
    'contact.livechat': 'แชทสด',
    'contact.faq': 'คำถามที่พบบ่อย',

    // Account
    'account.dashboard': 'ภาพรวม',
    'account.profile': 'ข้อมูลส่วนตัว',
    'account.bookings': 'ประวัติการจอง',
    'account.wishlist': 'รายการโปรด',
    'account.points': 'คะแนนสะสม',
    'account.payments': 'ประวัติการชำระเงิน',
    'account.security': 'ความปลอดภัย',
    'account.welcome': 'สวัสดี',
    'account.totalbookings': 'การจอง',
    'account.totalspent': 'ยอดใช้จ่าย',
    'account.tier': 'ระดับ',
    
    // Booking
    'booking.title': 'จองห้องพัก',
    'booking.confirm': 'ยืนยันการจอง',
    'booking.cancel': 'ยกเลิก',
    'booking.success': 'จองสำเร็จ',
    'booking.pending': 'รอยืนยัน',
    'booking.confirmed': 'ยืนยันแล้ว',

    // Auth
    'auth.login': 'เข้าสู่ระบบ',
    'auth.register': 'สมัครสมาชิก',
    'auth.email': 'อีเมล',
    'auth.password': 'รหัสผ่าน',
    'auth.name': 'ชื่อ',
    'auth.confirmpassword': 'ยืนยันรหัสผ่าน',

    // Footer
    'footer.quicklinks': 'ลิงก์ด่วน',
    'footer.contact': 'ติดต่อเรา',
    'footer.follow': 'ติดตามเรา',
    'footer.rights': 'สงวนลิขสิทธิ์',

    // Common
    'common.loading': 'กำลังโหลด...',
    'common.save': 'บันทึก',
    'common.cancel': 'ยกเลิก',
    'common.edit': 'แก้ไข',
    'common.delete': 'ลบ',
    'common.submit': 'ส่ง',
    'common.search': 'ค้นหา',
    'common.filter': 'กรอง',
    'common.viewmore': 'ดูเพิ่มเติม',
    'common.readmore': 'อ่านเพิ่มเติม',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.rooms': 'Rooms',
    'nav.reviews': 'Reviews',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.account': 'Account',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',

    // Hero Section
    'hero.title': 'Welcome to Our Hotel',
    'hero.subtitle': 'Experience luxury and comfort in a peaceful atmosphere',
    'hero.cta': 'Book Now',
    'hero.learn': 'Learn More',

    // Features
    'features.title': 'Special Features',
    'features.subtitle': 'What makes us different',
    'feature.wifi.title': 'High-Speed Wi-Fi',
    'feature.wifi.desc': 'Free high-speed Wi-Fi everywhere',
    'feature.pool.title': 'Swimming Pool',
    'feature.pool.desc': 'Outdoor and indoor pools',
    'feature.spa.title': 'Spa & Fitness',
    'feature.spa.desc': 'Relax with world-class spa services',
    'feature.restaurant.title': 'Restaurant',
    'feature.restaurant.desc': 'International and local cuisine',
    'feature.parking.title': 'Parking',
    'feature.parking.desc': 'Free parking for guests',
    'feature.service.title': '24-Hour Service',
    'feature.service.desc': 'We are available 24/7',

    // Rooms
    'rooms.title': 'Our Rooms',
    'rooms.featured': 'Featured Rooms',
    'rooms.view': 'View Rooms',
    'rooms.book': 'Book Now',
    'rooms.pernight': '/night',
    'rooms.guests': 'Guests',
    'rooms.checkin': 'Check-in',
    'rooms.checkout': 'Check-out',
    'rooms.details': 'Details',
    'rooms.amenities': 'Amenities',

    // Reviews
    'reviews.title': 'Customer Reviews',
    'reviews.subtitle': 'What our guests say',
    'reviews.write': 'Write Review',
    'reviews.all': 'All Reviews',
    'reviews.rating': 'Rating',
    'reviews.verified': 'Verified',

    // About
    'about.title': 'About Us',
    'about.subtitle': 'Our Story',
    'about.description': 'We are a leading hotel committed to providing the best service',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We would love to hear from you',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.livechat': 'Live Chat',
    'contact.faq': 'FAQ',

    // Account
    'account.dashboard': 'Dashboard',
    'account.profile': 'Profile',
    'account.bookings': 'Bookings',
    'account.wishlist': 'Wishlist',
    'account.points': 'Points',
    'account.payments': 'Payment History',
    'account.security': 'Security',
    'account.welcome': 'Welcome',
    'account.totalbookings': 'Bookings',
    'account.totalspent': 'Total Spent',
    'account.tier': 'Tier',

    // Booking
    'booking.title': 'Book Room',
    'booking.confirm': 'Confirm Booking',
    'booking.cancel': 'Cancel',
    'booking.success': 'Success',
    'booking.pending': 'Pending',
    'booking.confirmed': 'Confirmed',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.confirmpassword': 'Confirm Password',

    // Footer
    'footer.quicklinks': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.follow': 'Follow Us',
    'footer.rights': 'All rights reserved',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.viewmore': 'View More',
    'common.readmore': 'Read More',
  },
  cn: {
    // Navigation
    'nav.home': '首页',
    'nav.rooms': '客房',
    'nav.reviews': '评论',
    'nav.about': '关于我们',
    'nav.contact': '联系我们',
    'nav.login': '登录',
    'nav.register': '注册',
    'nav.account': '账户',
    'nav.admin': '管理',
    'nav.logout': '退出',

    // Hero Section
    'hero.title': '欢迎来到我们的酒店',
    'hero.subtitle': '在宁静的氛围中体验奢华与舒适',
    'hero.cta': '立即预订',
    'hero.learn': '了解更多',

    // Features
    'features.title': '特色服务',
    'features.subtitle': '我们的与众不同之处',
    'feature.wifi.title': '高速Wi-Fi',
    'feature.wifi.desc': '全区域免费高速Wi-Fi',
    'feature.pool.title': '游泳池',
    'feature.pool.desc': '室外和室内游泳池',
    'feature.spa.title': '水疗与健身',
    'feature.spa.desc': '享受世界级水疗服务',
    'feature.restaurant.title': '餐厅',
    'feature.restaurant.desc': '国际和当地美食',
    'feature.parking.title': '停车场',
    'feature.parking.desc': '为客人提供免费停车',
    'feature.service.title': '24小时服务',
    'feature.service.desc': '我们全天候为您服务',

    // Rooms
    'rooms.title': '我们的客房',
    'rooms.featured': '推荐客房',
    'rooms.view': '查看客房',
    'rooms.book': '立即预订',
    'rooms.pernight': '/晚',
    'rooms.guests': '客人',
    'rooms.checkin': '入住',
    'rooms.checkout': '退房',
    'rooms.details': '详情',
    'rooms.amenities': '设施',

    // Reviews
    'reviews.title': '客户评论',
    'reviews.subtitle': '我们客人的评价',
    'reviews.write': '写评论',
    'reviews.all': '所有评论',
    'reviews.rating': '评分',
    'reviews.verified': '已验证',

    // About
    'about.title': '关于我们',
    'about.subtitle': '我们的故事',
    'about.description': '我们是致力于提供最佳服务的领先酒店',

    // Contact
    'contact.title': '联系我们',
    'contact.subtitle': '我们期待您的来信',
    'contact.name': '姓名',
    'contact.email': '电子邮件',
    'contact.message': '留言',
    'contact.send': '发送消息',
    'contact.livechat': '在线聊天',
    'contact.faq': '常见问题',

    // Account
    'account.dashboard': '概览',
    'account.profile': '个人资料',
    'account.bookings': '预订历史',
    'account.wishlist': '收藏夹',
    'account.points': '积分',
    'account.payments': '支付历史',
    'account.security': '安全',
    'account.welcome': '欢迎',
    'account.totalbookings': '预订',
    'account.totalspent': '总消费',
    'account.tier': '等级',

    // Booking
    'booking.title': '预订客房',
    'booking.confirm': '确认预订',
    'booking.cancel': '取消',
    'booking.success': '成功',
    'booking.pending': '待确认',
    'booking.confirmed': '已确认',

    // Auth
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.email': '电子邮件',
    'auth.password': '密码',
    'auth.name': '姓名',
    'auth.confirmpassword': '确认密码',

    // Footer
    'footer.quicklinks': '快速链接',
    'footer.contact': '联系我们',
    'footer.follow': '关注我们',
    'footer.rights': '版权所有',

    // Common
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.submit': '提交',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.viewmore': '查看更多',
    'common.readmore': '阅读更多',
  },
  ru: {
    // Navigation
    'nav.home': 'Главная',
    'nav.rooms': 'Номера',
    'nav.reviews': 'Отзывы',
    'nav.about': 'О нас',
    'nav.contact': 'Контакты',
    'nav.login': 'Войти',
    'nav.register': 'Регистрация',
    'nav.account': 'Аккаунт',
    'nav.admin': 'Админ',
    'nav.logout': 'Выйти',

    // Hero Section
    'hero.title': 'Добро пожаловать в наш отель',
    'hero.subtitle': 'Испытайте роскошь и комфорт в спокойной атмосфере',
    'hero.cta': 'Забронировать',
    'hero.learn': 'Узнать больше',

    // Features
    'features.title': 'Особенности',
    'features.subtitle': 'Что делает нас особенными',
    'feature.wifi.title': 'Высокоскоростной Wi-Fi',
    'feature.wifi.desc': 'Бесплатный высокоскоростной Wi-Fi везде',
    'feature.pool.title': 'Бассейн',
    'feature.pool.desc': 'Открытый и крытый бассейны',
    'feature.spa.title': 'Спа и фитнес',
    'feature.spa.desc': 'Расслабьтесь со спа-услугами мирового класса',
    'feature.restaurant.title': 'Ресторан',
    'feature.restaurant.desc': 'Международная и местная кухня',
    'feature.parking.title': 'Парковка',
    'feature.parking.desc': 'Бесплатная парковка для гостей',
    'feature.service.title': 'Круглосуточный сервис',
    'feature.service.desc': 'Мы доступны 24/7',

    // Rooms
    'rooms.title': 'Наши номера',
    'rooms.featured': 'Рекомендуемые номера',
    'rooms.view': 'Посмотреть номера',
    'rooms.book': 'Забронировать',
    'rooms.pernight': '/ночь',
    'rooms.guests': 'Гости',
    'rooms.checkin': 'Заезд',
    'rooms.checkout': 'Выезд',
    'rooms.details': 'Детали',
    'rooms.amenities': 'Удобства',

    // Reviews
    'reviews.title': 'Отзывы клиентов',
    'reviews.subtitle': 'Что говорят наши гости',
    'reviews.write': 'Написать отзыв',
    'reviews.all': 'Все отзывы',
    'reviews.rating': 'Рейтинг',
    'reviews.verified': 'Проверено',

    // About
    'about.title': 'О нас',
    'about.subtitle': 'Наша история',
    'about.description': 'Мы ведущий отель, стремящийся предоставить лучший сервис',

    // Contact
    'contact.title': 'Свяжитесь с нами',
    'contact.subtitle': 'Мы будем рады услышать вас',
    'contact.name': 'Имя',
    'contact.email': 'Электронная почта',
    'contact.message': 'Сообщение',
    'contact.send': 'Отправить',
    'contact.livechat': 'Онлайн-чат',
    'contact.faq': 'Часто задаваемые вопросы',

    // Account
    'account.dashboard': 'Панель',
    'account.profile': 'Профиль',
    'account.bookings': 'Бронирования',
    'account.wishlist': 'Избранное',
    'account.points': 'Баллы',
    'account.payments': 'История платежей',
    'account.security': 'Безопасность',
    'account.welcome': 'Добро пожаловать',
    'account.totalbookings': 'Бронирований',
    'account.totalspent': 'Всего потрачено',
    'account.tier': 'Уровень',

    // Booking
    'booking.title': 'Забронировать номер',
    'booking.confirm': 'Подтвердить бронирование',
    'booking.cancel': 'Отменить',
    'booking.success': 'Успешно',
    'booking.pending': 'В ожидании',
    'booking.confirmed': 'Подтверждено',

    // Auth
    'auth.login': 'Войти',
    'auth.register': 'Регистрация',
    'auth.email': 'Электронная почта',
    'auth.password': 'Пароль',
    'auth.name': 'Имя',
    'auth.confirmpassword': 'Подтвердите пароль',

    // Footer
    'footer.quicklinks': 'Быстрые ссылки',
    'footer.contact': 'Связаться с нами',
    'footer.follow': 'Подписывайтесь',
    'footer.rights': 'Все права защищены',

    // Common
    'common.loading': 'Загрузка...',
    'common.save': 'Сохранить',
    'common.cancel': 'Отменить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.submit': 'Отправить',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.viewmore': 'Показать еще',
    'common.readmore': 'Читать далее',
  },
  kr: {
    // Navigation
    'nav.home': '홈',
    'nav.rooms': '객실',
    'nav.reviews': '리뷰',
    'nav.about': '소개',
    'nav.contact': '연락처',
    'nav.login': '로그인',
    'nav.register': '회원가입',
    'nav.account': '계정',
    'nav.admin': '관리',
    'nav.logout': '로그아웃',

    // Hero Section
    'hero.title': '호텔에 오신 것을 환영합니다',
    'hero.subtitle': '평화로운 분위기에서 럭셔리와 편안함을 경험하세요',
    'hero.cta': '지금 예약',
    'hero.learn': '더 알아보기',

    // Features
    'features.title': '특별한 기능',
    'features.subtitle': '우리를 특별하게 만드는 것',
    'feature.wifi.title': '고속 Wi-Fi',
    'feature.wifi.desc': '모든 곳에서 무료 고속 Wi-Fi',
    'feature.pool.title': '수영장',
    'feature.pool.desc': '실외 및 실내 수영장',
    'feature.spa.title': '스파 및 피트니스',
    'feature.spa.desc': '세계적인 수준의 스파 서비스로 휴식',
    'feature.restaurant.title': '레스토랑',
    'feature.restaurant.desc': '국제 및 현지 요리',
    'feature.parking.title': '주차',
    'feature.parking.desc': '투숙객을 위한 무료 주차',
    'feature.service.title': '24시간 서비스',
    'feature.service.desc': '24시간 이용 가능',

    // Rooms
    'rooms.title': '객실',
    'rooms.featured': '추천 객실',
    'rooms.view': '객실 보기',
    'rooms.book': '지금 예약',
    'rooms.pernight': '/박',
    'rooms.guests': '투숙객',
    'rooms.checkin': '체크인',
    'rooms.checkout': '체크아웃',
    'rooms.details': '세부정보',
    'rooms.amenities': '편의시설',

    // Reviews
    'reviews.title': '고객 리뷰',
    'reviews.subtitle': '투숙객의 말',
    'reviews.write': '리뷰 작성',
    'reviews.all': '모든 리뷰',
    'reviews.rating': '평점',
    'reviews.verified': '확인됨',

    // About
    'about.title': '소개',
    'about.subtitle': '우리의 이야기',
    'about.description': '우리는 최고의 서비스를 제공하는 선도적인 호텔입니다',

    // Contact
    'contact.title': '연락처',
    'contact.subtitle': '문의 사항을 보내주세요',
    'contact.name': '이름',
    'contact.email': '이메일',
    'contact.message': '메시지',
    'contact.send': '메시지 보내기',
    'contact.livechat': '실시간 채팅',
    'contact.faq': '자주 묻는 질문',

    // Account
    'account.dashboard': '대시보드',
    'account.profile': '프로필',
    'account.bookings': '예약',
    'account.wishlist': '위시리스트',
    'account.points': '포인트',
    'account.payments': '결제 내역',
    'account.security': '보안',
    'account.welcome': '환영합니다',
    'account.totalbookings': '예약',
    'account.totalspent': '총 지출',
    'account.tier': '등급',

    // Booking
    'booking.title': '객실 예약',
    'booking.confirm': '예약 확인',
    'booking.cancel': '취소',
    'booking.success': '성공',
    'booking.pending': '대기 중',
    'booking.confirmed': '확인됨',

    // Auth
    'auth.login': '로그인',
    'auth.register': '회원가입',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.name': '이름',
    'auth.confirmpassword': '비밀번호 확인',

    // Footer
    'footer.quicklinks': '빠른 링크',
    'footer.contact': '연락처',
    'footer.follow': '팔로우',
    'footer.rights': '모든 권리 보유',

    // Common
    'common.loading': '로딩 중...',
    'common.save': '저장',
    'common.cancel': '취소',
    'common.edit': '편집',
    'common.delete': '삭제',
    'common.submit': '제출',
    'common.search': '검색',
    'common.filter': '필터',
    'common.viewmore': '더 보기',
    'common.readmore': '더 읽기',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('th')
  const [currency, setCurrency] = useState<Currency>('THB')

  useEffect(() => {
    // Load from localStorage
    const savedLang = localStorage.getItem('language') as Language
    const savedCurrency = localStorage.getItem('currency') as Currency
    
    if (savedLang) setLanguageState(savedLang)
    if (savedCurrency) setCurrency(savedCurrency)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    
    // Auto-set currency based on language
    const currencyMap: Record<Language, Currency> = {
      th: 'THB',
      en: 'USD',
      cn: 'CNY',
      ru: 'RUB',
      kr: 'KRW',
    }
    const newCurrency = currencyMap[lang]
    setCurrency(newCurrency)
    localStorage.setItem('currency', newCurrency)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const convertPrice = (priceInTHB: number): number => {
    return Math.round(priceInTHB * exchangeRates[currency])
  }

  const formatPrice = (priceInTHB: number): string => {
    const converted = convertPrice(priceInTHB)
    const symbol = currencySymbols[currency]
    
    if (currency === 'THB') {
      return `${symbol}${converted.toLocaleString()}`
    } else if (currency === 'USD') {
      return `${symbol}${converted.toLocaleString()}`
    } else {
      return `${symbol}${converted.toLocaleString()}`
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        t,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
