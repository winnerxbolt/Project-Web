# 🏊 Poolvilla Pattaya - Premium Booking System

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://reactjs.org/)
[![Security](https://img.shields.io/badge/Security-A+-green)](./SECURITY.md)
[![License](https://img.shields.io/badge/License-Private-red)]()

Modern, secure, and feature-rich booking system for Poolvilla Pattaya with multi-language support, group bookings, dynamic pricing, and comprehensive admin management.

---

## ✨ Features

### 🌍 Multi-Language Support
- 5 Languages: Thai 🇹🇭 | English 🇬🇧 | Chinese 🇨🇳 | Russian 🇷🇺 | Korean 🇰🇷
- Auto currency conversion (THB, USD, CNY, RUB, KRW)
- 856+ translated strings
- Seamless language switching

### 👥 Group Booking System
- **Customer Features**:
  - 5-step booking wizard
  - Real-time pricing calculation
  - Discount tiers (10-25% off)
  - Corporate client support
  - Quote request system

- **Admin Features**:
  - Booking management dashboard
  - Discount configuration
  - Corporate client management
  - Quote templates
  - Booking statistics

### 💰 Dynamic Pricing
- Demand-based pricing rules
- Seasonal pricing adjustments
- Blackout dates management
- Real-time price calculation
- Flexible discount tiers

### 💾 Auto Backup System
- Scheduled daily backups (Vercel Cron)
- 24 data files coverage
- One-click restore functionality
- Auto-delete old backups
- Complete admin UI
- Backup history tracking

### 🔒 Security Features
- **Authentication**: PBKDF2 password hashing (600k iterations)
- **Rate Limiting**: IP-based protection
- **Input Validation**: XSS & injection prevention
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Error Handling**: Centralized & secure
- **Session Management**: HttpOnly, Secure cookies

### 📊 Admin Dashboard
- Booking management
- Room management
- Payment tracking
- Review moderation
- User management
- FAQ management
- Location management
- Video gallery
- Auto-reply configuration
- Backup management
- Group booking oversight
- Dynamic pricing control

### 🎨 User Features
- Modern responsive design
- Dark mode support
- Real-time availability checking
- Payment processing
- Review system with videos
- Wishlist functionality
- Points/rewards system
- Live chat support
- Notification system
- Profile management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/winnerxbolt/Project-Web.git
cd Project-Web

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configurations

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
Project-WebWin/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication
│   │   ├── bookings/        # Booking management
│   │   ├── group-bookings/  # Group booking system
│   │   ├── backup/          # Backup system
│   │   ├── payments/        # Payment processing
│   │   └── ...
│   ├── admin/               # Admin pages
│   ├── account/             # User account pages
│   ├── login/               # Authentication pages
│   └── ...
├── components/              # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── RoomCard.tsx
│   └── ...
├── contexts/                # React contexts
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── lib/                     # Utility libraries
│   ├── server/             # Server-side utilities
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── backup.ts
│   ├── security/           # Security utilities
│   │   ├── rateLimit.ts
│   │   ├── validation.ts
│   │   └── headers.ts
│   └── errors/             # Error handling
├── data/                    # JSON data storage
├── backups/                 # Backup storage
├── types/                   # TypeScript types
├── public/                  # Static files
├── SECURITY.md             # Security policy
├── CHANGELOG.md            # Version history
└── README.md               # This file
```

---

## 🔐 Security

This project implements industry-standard security practices:

- ✅ OWASP Top 10 compliance
- ✅ Rate limiting (5-100 req/15min)
- ✅ Strong password requirements
- ✅ Input validation & sanitization
- ✅ XSS & CSRF protection
- ✅ Secure session management
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Sensitive data redaction

See [SECURITY.md](SECURITY.md) for detailed information.

---

## 📝 Environment Variables

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security
CRON_SECRET=your-cron-secret-here
SESSION_SECRET=your-session-secret-here
ENCRYPTION_KEY=your-encryption-key-here

# OAuth (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Payment (Optional)
PAYMENT_API_KEY=your-payment-api-key
PAYMENT_SECRET_KEY=your-payment-secret-key
```

**Generate strong secrets:**
```bash
openssl rand -base64 32
```

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm start             # Start production server

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking
npm run format        # Format with Prettier

# Security
npm run security-check # Check for vulnerabilities
npm audit fix          # Fix vulnerabilities
```

---

## 📚 Documentation

- **[Security Policy](SECURITY.md)** - Security features and reporting
- **[Changelog](CHANGELOG.md)** - Version history and updates
- **[Backup Guide](BACKUP_SYSTEM_GUIDE.md)** - Backup system documentation
- **[Group Booking Guide](GROUP_BOOKING_GUIDE.md)** - Group booking documentation

---

## 🌟 Key Technologies

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 3** - Styling
- **React Icons** - Icon library
- **date-fns** - Date utilities

### Backend
- **Next.js API Routes** - Backend endpoints
- **File-based Database** - JSON storage
- **Vercel Cron** - Scheduled tasks
- **Crypto (Node.js)** - Password hashing

### Security
- PBKDF2 password hashing
- Rate limiting middleware
- Input validation library
- Security headers
- Error handling system

---

## 🎯 Features by User Role

### 👤 Regular Users
- Browse available rooms
- Check availability
- Make bookings
- Process payments
- Write reviews (with videos)
- Manage wishlist
- Earn points/rewards
- Live chat support
- Multi-language interface

### 👥 Group Bookings
- Request group quotes
- View discount tiers
- Submit bulk bookings
- Corporate client pricing
- Special requirements

### 👨‍💼 Administrators
- Full dashboard access
- User management
- Booking management
- Payment tracking
- Content management (rooms, videos, FAQ)
- Review moderation
- Auto-reply configuration
- Backup management
- Group booking oversight
- Dynamic pricing control
- System configuration

---

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/session` - Check session

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking

### Group Bookings
- `GET /api/group-bookings` - List group bookings
- `POST /api/group-bookings` - Create group booking
- `POST /api/group-bookings/calculate-price` - Calculate price
- `GET/PUT /api/group-bookings/discount-settings` - Manage discounts

### Backup
- `GET /api/backup` - List backups
- `POST /api/backup` - Create backup
- `POST /api/backup/auto` - Auto backup (cron)

See code for complete API documentation.

---

## 🔄 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**
3. **Configure Environment Variables**
4. **Deploy**

### Manual Deployment

```bash
# Build
npm run build

# Start
npm start
```

### Environment Requirements
- Node.js 18+
- HTTPS enabled
- Environment variables configured
- Cron jobs configured (for auto-backup)

---

## 🐛 Known Issues

- None currently reported

---

## 📈 Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Bundle Size**: Optimized
- **Image Optimization**: Enabled

---

## 🤝 Contributing

This is a private project. Contact the development team for contribution guidelines.

---

## 📄 License

Private - All Rights Reserved

---

## 👨‍💻 Development Team

**Poolvilla Pattaya Development Team**
- Project Lead: [Your Name]
- Security: [Your Name]
- Frontend: [Your Name]
- Backend: [Your Name]

---

## 📞 Support

- **Website**: https://your-domain.com
- **Email**: support@your-domain.com
- **Security**: security@your-domain.com

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- React team for the UI library
- Open source community

---

**Built with ❤️ for Poolvilla Pattaya**

**Version**: 2.0.0  
**Last Updated**: December 10, 2025
