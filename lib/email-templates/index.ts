import { baseTemplate } from './base-template'

export function bookingConfirmationTemplate() {
  const content = `
    <p>สวัสดีคุณ <strong>{{guestName}}</strong>,</p>
    
    <p>ขอบคุณที่เลือกใช้บริการ Poolvilla Pattaya! เราได้รับการจองของคุณเรียบร้อยแล้ว</p>
    
    <div class="info-box">
      <div class="info-box-title">📋 รายละเอียดการจอง</div>
      <div class="info-row">
        <span class="info-label">หมายเลขการจอง</span>
        <span class="info-value">#{{bookingId}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">ห้องพัก</span>
        <span class="info-value">{{roomName}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">เช็คอิน</span>
        <span class="info-value">{{checkIn}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">เช็คเอาท์</span>
        <span class="info-value">{{checkOut}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">จำนวนผู้เข้าพัก</span>
        <span class="info-value">{{guests}} ท่าน</span>
      </div>
      <div class="info-row">
        <span class="info-label">จำนวนคืน</span>
        <span class="info-value">{{nights}} คืน</span>
      </div>
      <div class="info-row" style="border-top: 2px solid #667eea; padding-top: 12px; margin-top: 12px;">
        <span class="info-label" style="font-size: 18px;">ยอดรวมทั้งหมด</span>
        <span class="info-value" style="font-size: 20px; color: #667eea;">{{total}} บาท</span>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{websiteUrl}}/account" class="button">
        ดูรายละเอียดการจอง
      </a>
    </div>
    
    <div class="divider"></div>
    
    <h3 style="color: #2d3748; margin-bottom: 15px;">📍 ขั้นตอนถัดไป</h3>
    <ol style="color: #4a5568; padding-left: 20px; line-height: 2;">
      <li><strong>ชำระเงิน:</strong> กรุณาชำระเงินเพื่อยืนยันการจอง</li>
      <li><strong>รับการยืนยัน:</strong> เราจะส่งอีเมลยืนยันหลังชำระเงินสำเร็จ</li>
      <li><strong>เช็คอิน:</strong> เช็คอินได้ตั้งแต่ 14:00 น.</li>
    </ol>
    
    <div class="info-box" style="background-color: #fff5f5; border-left-color: #fc8181; margin-top: 30px;">
      <p style="color: #742a2a; margin: 0;">
        <strong>⚠️ หมายเหตุ:</strong> การจองจะยืนยันเมื่อชำระเงินเรียบร้อยแล้ว กรุณาชำระภายใน 24 ชั่วโมง
      </p>
    </div>
    
    <p style="margin-top: 30px;">หากมีคำถามหรือต้องการความช่วยเหลือ โปรดติดต่อเรา:</p>
    <p style="color: #667eea; font-weight: bold;">
      📞 โทร: 0xx-xxx-xxxx<br>
      💬 LINE: @poolvillapattaya<br>
      📧 Email: info@poolvillapattaya.com
    </p>
    
    <p style="margin-top: 30px;">รอต้อนรับคุณอย่างใจจดใจจ่อ<br><strong>ทีมงาน Poolvilla Pattaya</strong></p>
  `

  return baseTemplate({
    title: '✅ ยืนยันการจองของคุณ',
    preheader: 'การจองของคุณได้รับการยืนยันแล้ว - หมายเลข #{{bookingId}}',
    content,
  })
}

export function paymentReceiptTemplate() {
  const content = `
    <p>สวัสดีคุณ <strong>{{guestName}}</strong>,</p>
    
    <p>ขอบคุณสำหรับการชำระเงิน! เราได้รับชำระเงินของคุณเรียบร้อยแล้ว</p>
    
    <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
      <div style="color: rgba(255,255,255,0.9); font-size: 14px; margin-bottom: 5px;">ชำระเงินสำเร็จ</div>
      <div style="color: #ffffff; font-size: 36px; font-weight: bold;">✓</div>
      <div style="color: #ffffff; font-size: 32px; font-weight: bold; margin-top: 10px;">{{amount}} บาท</div>
    </div>
    
    <div class="info-box">
      <div class="info-box-title">💳 รายละเอียดการชำระเงิน</div>
      <div class="info-row">
        <span class="info-label">เลขที่ใบเสร็จ</span>
        <span class="info-value">{{paymentId}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">หมายเลขการจอง</span>
        <span class="info-value">#{{bookingId}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">วิธีการชำระเงิน</span>
        <span class="info-value">{{paymentMethod}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">วันที่ชำระ</span>
        <span class="info-value">{{paidAt}}</span>
      </div>
    </div>
    
    <div class="info-box" style="background-color: #f0fff4; border-left-color: #48bb78;">
      <div class="info-box-title" style="color: #22543d;">🏨 ข้อมูลที่พัก</div>
      <div class="info-row">
        <span class="info-label">ห้องพัก</span>
        <span class="info-value">{{roomName}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">เช็คอิน</span>
        <span class="info-value">{{checkIn}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">เช็คเอาท์</span>
        <span class="info-value">{{checkOut}}</span>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{websiteUrl}}/payment-success/{{bookingId}}" class="button">
        ดาวน์โหลดใบเสร็จ PDF
      </a>
    </div>
    
    <div class="divider"></div>
    
    <h3 style="color: #2d3748; margin-bottom: 15px;">🎉 เตรียมตัวเช็คอิน!</h3>
    <p style="color: #4a5568;">เราจะส่งอีเมลเตือนอีกครั้งก่อนวันเช็คอิน 1 วัน พร้อมรายละเอียดสำคัญ</p>
    
    <div class="info-box" style="background-color: #fffaf0; border-left-color: #ed8936;">
      <h4 style="color: #7c2d12; margin-bottom: 10px;">📍 ที่ตั้ง</h4>
      <p style="color: #744210; margin: 0;">
        123/45 หาดจอมเทียน พัทยา ชลบุรี 20150<br>
        <a href="https://maps.google.com" style="color: #ed8936;">📍 เปิดใน Google Maps</a>
      </p>
    </div>
    
    <p style="margin-top: 30px;">ขอบคุณที่เลือกใช้บริการ Poolvilla Pattaya<br><strong>ทีมงาน Poolvilla Pattaya</strong></p>
  `

  return baseTemplate({
    title: '💳 ชำระเงินสำเร็จ!',
    preheader: 'ชำระเงินเรียบร้อยแล้ว {{amount}} บาท - ใบเสร็จ #{{paymentId}}',
    content,
  })
}

export function checkInReminderTemplate() {
  const content = `
    <p>สวัสดีคุณ <strong>{{guestName}}</strong>,</p>
    
    <div style="text-align: center; margin: 30px 0; padding: 30px; background: linear-gradient(135deg, #4299e1 0%, #667eea 100%); border-radius: 12px;">
      <div style="color: #ffffff; font-size: 48px; margin-bottom: 10px;">📅</div>
      <div style="color: #ffffff; font-size: 24px; font-weight: bold;">พรุ่งนี้คือวันเช็คอิน!</div>
      <div style="color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 10px;">{{checkIn}}</div>
    </div>
    
    <p style="font-size: 18px; color: #2d3748; text-align: center;">
      เราตื่นเต้นที่จะต้อนรับคุณที่ <strong>{{roomName}}</strong>
    </p>
    
    <div class="divider"></div>
    
    <div class="info-box">
      <div class="info-box-title">⏰ ข้อมูลการเช็คอิน</div>
      <div class="info-row">
        <span class="info-label">วันที่</span>
        <span class="info-value">{{checkIn}}</span>
      </div>
      <div class="info-row">
        <span class="info-label">เวลา</span>
        <span class="info-value">{{checkInTime}} น. เป็นต้นไป</span>
      </div>
      <div class="info-row">
        <span class="info-label">หมายเลขการจอง</span>
        <span class="info-value">#{{bookingId}}</span>
      </div>
    </div>
    
    <div class="info-box" style="background-color: #f0fff4; border-left-color: #48bb78;">
      <div class="info-box-title" style="color: #22543d;">📍 ที่อยู่</div>
      <p style="color: #2f855a; margin: 0; font-size: 16px;">
        <strong>{{address}}</strong><br>
        <a href="https://maps.google.com" style="color: #48bb78; margin-top: 10px; display: inline-block;">
          📍 เปิดใน Google Maps
        </a>
      </p>
    </div>
    
    <div class="info-box" style="background-color: #fff5f5; border-left-color: #fc8181;">
      <div class="info-box-title" style="color: #742a2a;">📞 ติดต่อฉุกเฉิน</div>
      <p style="color: #742a2a; margin: 0;">
        <strong>โทร: {{phone}}</strong><br>
        LINE: @poolvillapattaya<br>
        Email: info@poolvillapattaya.com
      </p>
    </div>
    
    <div class="divider"></div>
    
    <h3 style="color: #2d3748; margin-bottom: 15px;">✅ เช็คลิสต์ก่อนเช็คอิน</h3>
    <ul style="color: #4a5568; padding-left: 20px; line-height: 2;">
      <li>นำบัตรประชาชน/พาสปอร์ต</li>
      <li>เตรียมเลขที่การจอง: <strong>#{{bookingId}}</strong></li>
      <li>เช็คสภาพอากาศและเตรียมเสื้อผ้า</li>
      <li>ห้ามนำสัตว์เลี้ยงเข้าห้องพัก</li>
      <li>งดสูบบุหรี่ในห้องพัก</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{websiteUrl}}/account" class="button">
        ดูรายละเอียดการจอง
      </a>
    </div>
    
    <div class="info-box" style="background-color: #fffaf0; border-left-color: #ed8936;">
      <h4 style="color: #7c2d12; margin-bottom: 10px;">🎁 เคล็ดลับพิเศษ</h4>
      <p style="color: #744210; margin: 0;">
        มาถึงก่อน 16:00 น. เพื่อเพลิดเพลินกับพระอาทิตย์ตกที่สระว่ายน้ำส่วนตัว!
      </p>
    </div>
    
    <p style="margin-top: 30px;">รอต้อนรับคุณพรุ่งนี้!<br><strong>ทีมงาน Poolvilla Pattaya</strong></p>
  `

  return baseTemplate({
    title: '⏰ เตือน: พรุ่งนี้เช็คอิน!',
    preheader: 'พรุ่งนี้คือวันเช็คอินของคุณที่ {{roomName}}',
    content,
  })
}

export function passwordResetTemplate() {
  const content = `
    <p>สวัสดี,</p>
    
    <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
    
    <div style="text-align: center; margin: 30px 0; padding: 30px; background-color: #fff5f5; border-radius: 12px; border: 2px dashed #fc8181;">
      <div style="color: #c53030; font-size: 48px; margin-bottom: 10px;">🔐</div>
      <div style="color: #742a2a; font-size: 18px; font-weight: bold;">คำขอรีเซ็ตรหัสผ่าน</div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" class="button">
        รีเซ็ตรหัสผ่าน
      </a>
    </div>
    
    <p style="text-align: center; color: #718096; font-size: 14px;">
      หรือคัดลอกลิงก์นี้:<br>
      <code style="background-color: #f7fafc; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; word-break: break-all;">
        {{resetUrl}}
      </code>
    </p>
    
    <div class="divider"></div>
    
    <div class="info-box" style="background-color: #fffaf0; border-left-color: #ed8936;">
      <p style="color: #7c2d12; margin: 0;">
        <strong>⏰ ลิงก์นี้จะหมดอายุใน {{expiresIn}}</strong><br>
        หากคุณไม่ได้ทำการรีเซ็ตรหัสผ่าน ลิงก์จะหมดอายุโดยอัตโนมัติ
      </p>
    </div>
    
    <div class="info-box" style="background-color: #fff5f5; border-left-color: #fc8181; margin-top: 20px;">
      <p style="color: #742a2a; margin: 0;">
        <strong>⚠️ หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน</strong><br>
        กรุณาเพิกเฉยต่ออีเมลนี้ รหัสผ่านของคุณจะยังคงปลอดภัย<br>
        หากสงสัยโปรดติดต่อ: <strong>{{supportEmail}}</strong>
      </p>
    </div>
    
    <div class="divider"></div>
    
    <h3 style="color: #2d3748; margin-bottom: 15px;">🔒 เคล็ดลับรหัสผ่านที่ดี</h3>
    <ul style="color: #4a5568; padding-left: 20px; line-height: 2;">
      <li>ใช้อย่างน้อย 8 ตัวอักษร</li>
      <li>ผสมตัวพิมพ์เล็ก-ใหญ่</li>
      <li>เพิ่มตัวเลขและสัญลักษณ์พิเศษ</li>
      <li>ไม่ใช้รหัสผ่านเดียวกันกับเว็บอื่น</li>
      <li>เปลี่ยนรหัสผ่านเป็นประจำ</li>
    </ul>
    
    <p style="margin-top: 30px;">ขอบคุณครับ<br><strong>ทีมงาน Poolvilla Pattaya</strong></p>
  `

  return baseTemplate({
    title: '🔐 รีเซ็ตรหัสผ่าน',
    preheader: 'คำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ',
    content,
  })
}

export function welcomeTemplate() {
  const content = `
    <div style="text-align: center; margin: 30px 0;">
      <div style="font-size: 72px; margin-bottom: 20px;">🎉</div>
      <h2 style="color: #2d3748; font-size: 28px; margin-bottom: 10px;">ยินดีต้อนรับ!</h2>
    </div>
    
    <p style="font-size: 18px; text-align: center; color: #4a5568;">
      สวัสดีคุณ <strong>{{name}}</strong>,<br>
      ขอบคุณที่สมัครสมาชิกกับ Poolvilla Pattaya
    </p>
    
    <div class="info-box" style="background-color: #f0fff4; border-left-color: #48bb78;">
      <p style="color: #22543d; margin: 0;">
        <strong>✅ บัญชีของคุณพร้อมใช้งานแล้ว!</strong><br>
        Email: {{email}}
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{websiteUrl}}" class="button">
        เริ่มเลือกห้องพัก
      </a>
    </div>
    
    <div class="divider"></div>
    
    <h3 style="color: #2d3748; margin-bottom: 15px;">🎁 สิทธิประโยชน์สมาชิก</h3>
    <div style="display: grid; gap: 15px;">
      <div style="padding: 20px; background-color: #f7fafc; border-radius: 8px; border-left: 4px solid #667eea;">
        <div style="font-size: 24px; margin-bottom: 10px;">💎</div>
        <h4 style="color: #2d3748; margin: 0 0 5px 0;">สะสมแต้ม</h4>
        <p style="color: #718096; margin: 0; font-size: 14px;">รับแต้มทุกครั้งที่จอง 1 บาท = 1 แต้ม</p>
      </div>
      
      <div style="padding: 20px; background-color: #f7fafc; border-radius: 8px; border-left: 4px solid #48bb78;">
        <div style="font-size: 24px; margin-bottom: 10px;">🎫</div>
        <h4 style="color: #2d3748; margin: 0 0 5px 0;">ส่วนลดพิเศษ</h4>
        <p style="color: #718096; margin: 0; font-size: 14px;">รับส่วนลดและโปรโมชั่นสำหรับสมาชิกเท่านั้น</p>
      </div>
      
      <div style="padding: 20px; background-color: #f7fafc; border-radius: 8px; border-left: 4px solid #ed8936;">
        <div style="font-size: 24px; margin-bottom: 10px;">⏰</div>
        <h4 style="color: #2d3748; margin: 0 0 5px 0;">จองได้ก่อนใคร</h4>
        <p style="color: #718096; margin: 0; font-size: 14px;">Early Bird สำหรับห้องใหม่และช่วงเทศกาล</p>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <h3 style="color: #2d3748; margin-bottom: 15px;">🚀 เริ่มต้นใช้งาน</h3>
    <ol style="color: #4a5568; padding-left: 20px; line-height: 2;">
      <li><strong>เลือกห้องพัก:</strong> เลือกจากห้องพักหลากหลายสไตล์</li>
      <li><strong>เลือกวันที่:</strong> เช็คความพร้อมและเลือกวันที่เข้าพัก</li>
      <li><strong>จองเลย:</strong> จองและชำระเงินง่ายๆ ออนไลน์</li>
      <li><strong>เช็คอิน:</strong> รอรับการยืนยันและเตรียมตัวเดินทาง!</li>
    </ol>
    
    <div class="info-box" style="background-color: #fffaf0; border-left-color: #ed8936; margin-top: 30px;">
      <p style="color: #7c2d12; margin: 0;">
        <strong>💡 เคล็ดลับ:</strong> เพิ่ม <a href="{{websiteUrl}}/wishlist" style="color: #ed8936;">Wishlist</a> 
        เพื่อติดตามห้องที่คุณสนใจและรับการแจ้งเตือนเมื่อมีส่วนลด!
      </p>
    </div>
    
    <p style="margin-top: 30px; text-align: center;">
      พบปัญหาหรือมีคำถาม?<br>
      <a href="{{websiteUrl}}/contact" style="color: #667eea;">ติดต่อทีมงาน</a> หรือ
      <a href="{{websiteUrl}}/faq" style="color: #667eea;">อ่าน FAQ</a>
    </p>
    
    <p style="margin-top: 30px; text-align: center;">
      ยินดีต้อนรับสู่ครอบครัว Poolvilla Pattaya!<br>
      <strong>ทีมงาน Poolvilla Pattaya</strong>
    </p>
  `

  return baseTemplate({
    title: '🎉 ยินดีต้อนรับสู่ Poolvilla Pattaya!',
    preheader: 'บัญชีของคุณพร้อมใช้งานแล้ว - เริ่มจองห้องพักได้เลย!',
    content,
  })
}

export const emailTemplates = {
  bookingConfirmation: bookingConfirmationTemplate,
  paymentReceipt: paymentReceiptTemplate,
  checkInReminder: checkInReminderTemplate,
  passwordReset: passwordResetTemplate,
  welcome: welcomeTemplate,
}

export default emailTemplates
