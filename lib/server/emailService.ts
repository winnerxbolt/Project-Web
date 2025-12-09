import nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(emailConfig)
  }
  return transporter
}

// Email sending options
interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

/**
 * Send email using nodemailer
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('⚠️ SMTP not configured. Email simulation mode.')
      console.log(`📧 [SIMULATED] Email to: ${options.to}`)
      console.log(`Subject: ${options.subject}`)
      return {
        success: true,
        messageId: `sim-${Date.now()}`,
        simulated: true,
      }
    }

    const transporter = getTransporter()

    // Prepare email options
    const mailOptions = {
      from: options.from || `"${process.env.FROM_NAME || 'Pool Villa Pattaya'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      replyTo: options.replyTo || process.env.FROM_EMAIL || process.env.SMTP_USER,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    }

    // Send email
    const info = await transporter.sendMail(mailOptions)

    console.log('✅ Email sent successfully:', info.messageId)
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      simulated: false,
    }
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message)
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection() {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return {
        success: false,
        error: 'SMTP not configured',
        simulated: true,
      }
    }

    const transporter = getTransporter()
    await transporter.verify()

    console.log('✅ SMTP connection verified')
    return {
      success: true,
      message: 'SMTP connection verified',
    }
  } catch (error: any) {
    console.error('❌ SMTP verification failed:', error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Send bulk emails (with delay to avoid rate limiting)
 */
export async function sendBulkEmails(
  emails: SendEmailOptions[],
  delayMs: number = 100
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (const email of emails) {
    try {
      await sendEmail(email)
      results.sent++

      // Add delay to avoid rate limiting
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error: any) {
      results.failed++
      results.errors.push(`${email.to}: ${error.message}`)
    }
  }

  return results
}

/**
 * Replace variables in email template
 */
export function replaceVariables(
  text: string,
  variables: Record<string, string>
): string {
  let result = text
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  })
  return result
}
