# 🔒 MULTI-LAYER SECURITY SYSTEM

## ระบบความปลอดภัยหลายชั้นที่แกะไม่ได้

### 🛡️ Password Encryption (3 ชั้น)

```
รหัสผ่านต้นฉบับ
    ↓
[ชั้นที่ 1] SHA-512 + PEPPER
    ↓
[ชั้นที่ 2] bcrypt (12 rounds)
    ↓
[ชั้นที่ 3] AES-256 Encryption
    ↓
รหัสผ่านที่เข้ารหัสแล้ว (แกะไม่ได้)
```

### 🔐 JWT Token Security (Double-Signed)

```
User Data
    ↓
[ชั้นที่ 1] AES-256 Encrypt Payload
    ↓
[ชั้นที่ 2] JWT Sign (Primary Secret)
    ↓
[ชั้นที่ 3] JWT Sign (Secondary Secret)
    ↓
Final Token (แกะไม่ได้)
```

### 🍪 Cookie Security

- **httpOnly**: JavaScript เข้าถึงไม่ได้
- **secure**: HTTPS only (production)
- **sameSite: strict**: ป้องกัน CSRF
- **path: /**: ใช้ได้ทุก route
- **maxAge: 7 days**: หมดอายุอัตโนมัติ

### 🔑 Secret Keys

**ใน Production ต้องตั้งค่าใน Environment Variables:**

```env
# Password Encryption
PASSWORD_PEPPER=your-ultra-secret-pepper-key
AES_SECRET=your-aes-master-key

# JWT Signing (2 ชั้น)
JWT_SECRET=your-jwt-primary-secret
JWT_SECRET_SECONDARY=your-jwt-secondary-secret

# Node Environment
NODE_ENV=production
```

### 📊 Security Levels

| Feature | Level | Description |
|---------|-------|-------------|
| Password Hashing | ⭐⭐⭐⭐⭐ | SHA-512 + bcrypt + AES-256 |
| JWT Token | ⭐⭐⭐⭐⭐ | Double-signed + Encrypted payload |
| Cookie Storage | ⭐⭐⭐⭐⭐ | httpOnly + secure + sameSite |
| CSRF Protection | ⭐⭐⭐⭐⭐ | Token-based validation |
| XSS Protection | ⭐⭐⭐⭐⭐ | No client-side token storage |

### 🎯 การทำงาน

#### Registration/Login:
1. Password → Hash 3 ชั้น → เก็บใน database
2. User Data → Encrypt payload → Double-sign JWT
3. JWT → เก็บใน httpOnly cookie
4. Client ไม่มีทางเข้าถึง token ได้

#### Verification:
1. อ่าน cookie → Verify signature ชั้นที่ 2
2. Verify signature ชั้นที่ 1
3. Decrypt payload
4. ตรวจสอบ issuer, audience, version
5. Return user data

#### Password Check:
1. Decrypt AES-256 (ชั้นที่ 3)
2. Compare bcrypt (ชั้นที่ 2)
3. Verify SHA-512+Pepper (ชั้นที่ 1)

### ⚠️ Security Notes

1. **ห้าม** เปิดเผย Secret Keys
2. **ห้าม** commit .env file
3. **ต้อง** ใช้ HTTPS ใน production
4. **ต้อง** rotate secrets ทุก 90 วัน
5. **ต้อง** monitor failed login attempts

### 🚀 Implementation Files

- `lib/security/encryption.ts` - Password & Data Encryption
- `lib/security/jwt.ts` - JWT Token Management
- `lib/server/auth.ts` - User Authentication
- `app/api/auth/*` - Authentication APIs

---


