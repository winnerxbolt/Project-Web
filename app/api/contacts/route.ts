import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { containsProfanity } from '@/lib/profanityFilter'

type ContactBody = {
  name: string
  email: string
  phone?: string
  message: string
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function saveContactToFile(payload: ContactBody & { ip: string; createdAt: string }) {
  const dataDir = path.join(process.cwd(), 'data')
  const filePath = path.join(dataDir, 'contacts.json')

  await fs.mkdir(dataDir, { recursive: true })
  const fileContents = await fs.readFile(filePath, 'utf-8').catch(() => '[]')
  let arr: any[] = []
  try {
    arr = JSON.parse(fileContents)
  } catch {
    arr = []
  }
  arr.unshift(payload)
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf-8')
}

async function trySendEmail(payload: ContactBody) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const to = process.env.CONTACT_TO

  if (!host || !user || !pass || !to) {
    // No SMTP config — skip send
    return
  }

  // use dynamic import to avoid bundling/installation issues
  try {

    const html = `
      <p>มีข้อความจากผู้ใช้ผ่านหน้า Contact</p>
      <ul>
        <li><strong>ชื่อ:</strong> ${payload.name}</li>
        <li><strong>อีเมล:</strong> ${payload.email}</li>
        <li><strong>เบอร์ติดต่อ:</strong> ${payload.phone || '-'}</li>
      </ul>
      <p><strong>ข้อความ:</strong></p>
      <div>${payload.message.replace(/\n/g, '<br/>')}</div>
    `
  } catch (err) {
    // Could not import/send with nodemailer — fallback to SendGrid if configured, otherwise log and continue
    console.warn('nodemailer send failed, trying SendGrid fallback', err)
    const sendgridApiKey = process.env.SENDGRID_API_KEY
    const sendTo = process.env.CONTACT_TO
    if (sendgridApiKey && sendTo) {
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: sendTo }] }],
            from: { email: payload.email, name: payload.name },
            subject: `Contact form: ${payload.name}`,
            content: [{ type: 'text/html', value: payload.message }],
          }),
        })
      } catch (sgErr) {
        console.error('SendGrid fallback failed', sgErr)
      }
    }
  }
}

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown') as string
    const body = (await req.json()) as ContactBody

    if (!body || !body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for profanity
    if (containsProfanity(body.name)) {
      return NextResponse.json({ error: 'ชื่อมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' }, { status: 400 })
    }
    if (containsProfanity(body.message)) {
      return NextResponse.json({ error: 'ข้อความมีคำไม่สุภาพ กรุณาใช้ภาษาที่เหมาะสม' }, { status: 400 })
    }
    if (!validateEmail(body.email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const payload = {
      ...body,
      ip,
      createdAt: new Date().toISOString(),
    }

    await saveContactToFile(payload)

    try {
      await trySendEmail(body)
    } catch (err) {
      console.error('send email error', err)
    }

    return NextResponse.json({ message: 'Contact saved' }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}