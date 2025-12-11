/**
 * Base Email Template - Beautiful & Responsive
 * สำหรับใช้เป็น wrapper ของอีเมลทุกแบบ
 */

export interface BaseTemplateProps {
  title: string
  preheader?: string
  content: string
  footer?: string
}

export function baseTemplate({ title, preheader, content, footer }: BaseTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif, 'Sarabun', sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f7fa;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    
    .email-logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      text-decoration: none;
      display: inline-block;
      margin-bottom: 10px;
    }
    
    .email-tagline {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }
    
    .email-body {
      padding: 40px 30px;
    }
    
    .email-title {
      font-size: 24px;
      font-weight: bold;
      color: #1a202c;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .email-content {
      font-size: 16px;
      color: #4a5568;
      line-height: 1.8;
    }
    
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }
    
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
    }
    
    .info-box {
      background-color: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    
    .info-box-title {
      font-weight: bold;
      color: #2d3748;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #718096;
      font-weight: 500;
    }
    
    .info-value {
      color: #2d3748;
      font-weight: bold;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e2e8f0, transparent);
      margin: 30px 0;
    }
    
    .email-footer {
      background-color: #2d3748;
      color: #cbd5e0;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    
    .footer-links {
      margin: 20px 0;
    }
    
    .footer-link {
      color: #90cdf4;
      text-decoration: none;
      margin: 0 10px;
    }
    
    .footer-link:hover {
      color: #ffffff;
    }
    
    .social-links {
      margin: 20px 0;
    }
    
    .social-link {
      display: inline-block;
      margin: 0 8px;
      color: #90cdf4;
      font-size: 24px;
      text-decoration: none;
    }
    
    .footer-text {
      color: #a0aec0;
      font-size: 12px;
      margin-top: 20px;
      line-height: 1.6;
    }
    
    @media only screen and (max-width: 600px) {
      .email-header {
        padding: 30px 20px;
      }
      
      .email-body {
        padding: 30px 20px;
      }
      
      .email-title {
        font-size: 20px;
      }
      
      .button {
        display: block;
        width: 100%;
      }
      
      .info-row {
        flex-direction: column;
        gap: 5px;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
  </div>
  ` : ''}
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <div class="email-container">
          <!-- Header -->
          <div class="email-header">
            <a href="{{websiteUrl}}" class="email-logo">
              🏊 Poolvilla Pattaya
            </a>
            <div class="email-tagline">
              Premium Pool Villa Booking Experience
            </div>
          </div>
          
          <!-- Body -->
          <div class="email-body">
            <h1 class="email-title">${title}</h1>
            <div class="email-content">
              ${content}
            </div>
          </div>
          
          <!-- Footer -->
          <div class="email-footer">
            <div class="footer-links">
              <a href="{{websiteUrl}}" class="footer-link">เว็บไซต์</a>
              <a href="{{websiteUrl}}/about" class="footer-link">เกี่ยวกับเรา</a>
              <a href="{{websiteUrl}}/contact" class="footer-link">ติดต่อเรา</a>
              <a href="{{websiteUrl}}/faq" class="footer-link">คำถามที่พบบ่อย</a>
            </div>
            
            <div class="social-links">
              <a href="#" class="social-link">📱</a>
              <a href="#" class="social-link">💬</a>
              <a href="#" class="social-link">📧</a>
            </div>
            
            <div class="divider" style="background: linear-gradient(to right, transparent, #4a5568, transparent);"></div>
            
            ${footer || `
            <div class="footer-text">
              <p><strong>Poolvilla Pattaya</strong></p>
              <p>123/45 หาดจอมเทียน พัทยา ชลบุรี 20150</p>
              <p>โทร: 0xx-xxx-xxxx | Email: info@poolvillapattaya.com</p>
              <p style="margin-top: 15px;">
                อีเมลนี้ส่งถึงคุณเนื่องจากคุณมีการจองกับเรา<br>
                หากคุณไม่ต้องการรับอีเมลจากเรา คลิก <a href="#" style="color: #90cdf4;">ยกเลิกการสมัคร</a>
              </p>
            </div>
            `}
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

export default baseTemplate
