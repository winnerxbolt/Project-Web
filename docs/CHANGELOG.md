# 📋 Changelog

All notable changes to Poolvilla Pattaya will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-12-10

### 🔒 Security Enhancements

#### Added
- **Rate Limiting System**
  - Login attempts: 5 per 15 minutes
  - Registration: 30 per 15 minutes
  - API calls: 100 per 15 minutes
  - Mutation operations: 30 per 15 minutes

- **Input Validation Library** (`lib/security/validation.ts`)
  - Email format validation
  - Strong password requirements (min 8 chars, mixed case, numbers)
  - Phone number validation (Thai format)
  - Date range validation
  - UUID validation
  - Amount/price validation
  - Credit card validation (Luhn algorithm)
  - XSS prevention with HTML escaping
  - Filename sanitization (path traversal prevention)

- **Security Headers** (`lib/security/headers.ts`)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Content-Security-Policy
  - Permissions-Policy
  - Strict-Transport-Security (HSTS)
  - CORS configuration

- **Error Handling System** (`lib/errors/AppError.ts`)
  - Centralized error handling
  - Custom error classes (ValidationError, AuthenticationError, etc.)
  - Sensitive data redaction in logs
  - Production-safe error messages

- **Middleware Protection** (`middleware.ts`)
  - Route protection for admin/member areas
  - Automatic redirect to login
  - Security headers on all responses

#### Changed
- **Password Hashing**: Increased PBKDF2 iterations from 310,000 to 600,000 (OWASP 2023)
- **Cookie Security**: SameSite policy changed from Lax to Strict
- **Error Messages**: Generic messages to prevent information leakage
- **Environment Variables**: Removed hardcoded secrets from `.env.example`

#### Fixed
- Email enumeration vulnerability in login/registration
- Missing input sanitization in auth endpoints
- Weak session cookie configuration
- Information disclosure in error responses

---

### 🚀 Features

#### Added
- **Multi-Language Support** (5 languages)
  - Thai (th) 🇹🇭
  - English (en) 🇬🇧
  - Chinese (cn) 🇨🇳
  - Russian (ru) 🇷🇺
  - Korean (kr) 🇰🇷
  - Auto currency conversion
  - Complete translations (856 lines)

- **Group Booking System**
  - Customer booking wizard (5 steps)
  - Admin management dashboard
  - Discount tiers (10%, 15%, 20%, 25%)
  - Corporate client management
  - Quote templates
  - Real-time pricing calculation
  - Complete API suite (4 endpoints)

- **Auto Backup System**
  - Scheduled daily backups (Vercel Cron)
  - 24 data files coverage
  - Restore functionality
  - Auto-delete old backups
  - Admin UI management
  - Complete documentation

- **Dynamic Pricing**
  - Demand-based pricing
  - Seasonal pricing rules
  - Blackout dates
  - Real-time calculation

---

### 🛠️ Improvements

#### Performance
- Enabled Next.js compression
- Optimized package imports (react-icons)
- Removed unnecessary console logs in production
- Improved image optimization settings

#### Code Quality
- TypeScript strict mode enabled
- Consistent error handling patterns
- Improved code documentation
- Better type safety throughout

#### Development
- Added `type-check` script
- Added `security-check` script
- Updated package.json metadata
- Better script organization

---

### 📚 Documentation

#### Added
- `SECURITY.md` - Complete security policy
- `BACKUP_SYSTEM_GUIDE.md` - Backup system documentation
- `GROUP_BOOKING_GUIDE.md` - Group booking documentation
- `CHANGELOG.md` - This file

#### Updated
- `.env.example` - Removed secrets, added all required variables
- `README.md` - Updated with new features (if exists)

---

### 🐛 Bug Fixes

#### Fixed
- TypeScript compilation errors in backup auto route
- Logo display issues across language switches
- Input text visibility in group booking forms
- Missing back button in booking wizard
- Session validation edge cases
- Password validation consistency

---

### ⚠️ Breaking Changes

#### Authentication
- **Password Requirements**: Now enforces strong passwords (breaking for weak existing passwords)
- **Cookie Policy**: Changed to SameSite=Strict (may affect some login flows)
- **Rate Limiting**: May block legitimate high-frequency usage

#### API Changes
- **Error Responses**: Changed format for consistency
- **Security Headers**: May affect iframe embedding or CORS

---

### 🔄 Migration Guide

#### From 1.x to 2.x

1. **Environment Variables**
   ```bash
   # Add new required variables
   CRON_SECRET=your-secret-here
   SESSION_SECRET=your-secret-here
   ENCRYPTION_KEY=your-secret-here
   ```

2. **Password Policy**
   - Users with weak passwords will be prompted to update
   - New registrations must meet strength requirements

3. **Rate Limiting**
   - Test your integration for rate limit compatibility
   - Adjust limits in `lib/security/rateLimit.ts` if needed

4. **Error Handling**
   - Update client-side error handling for new error format
   - Check error message parsing logic

---

## [1.0.0] - 2025-11-01

### Added
- Initial release
- Basic booking system
- User authentication
- Admin dashboard
- Room management
- Payment processing
- Review system
- FAQ management
- Location management
- Chat system

---

## Version Support

| Version | Status      | Release Date | End of Support |
|---------|-------------|--------------|----------------|
| 2.0.x   | ✅ Current  | 2025-12-10   | -              |
| 1.0.x   | ❌ Deprecated | 2025-11-01   | 2025-12-10     |

---

## Upgrade Priority

### Critical (Immediate)
- 🔴 Security vulnerabilities
- 🔴 Data loss risks
- 🔴 Authentication issues

### High (Within 1 week)
- 🟠 Performance improvements
- 🟠 Breaking changes
- 🟠 Major features

### Medium (Within 1 month)
- 🟡 Minor features
- 🟡 UI improvements
- 🟡 Documentation updates

### Low (Optional)
- 🟢 Code cleanup
- 🟢 Dependency updates
- 🟢 Nice-to-have features

---

## Links

- **Repository**: https://github.com/winnerxbolt/Project-Web
- **Issues**: https://github.com/winnerxbolt/Project-Web/issues
- **Security**: See [SECURITY.md](SECURITY.md)
- **Documentation**: See docs folder

---

**Maintained by**: Poolvilla Pattaya Development Team  
**Last Updated**: December 10, 2025
