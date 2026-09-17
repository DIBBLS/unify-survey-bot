import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { extractMessageText, extractPhoneNumber } from '@/lib/whatsapp'
import { handleIncomingMessage } from '@/lib/survey-engine'

function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret) {
    console.warn('WHATSAPP_APP_SECRET not set — skipping webhook signature verification.')
    return true
  }
  if (!signatureHeader) return false

  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex')
  const provided = signatureHeader.replace('sha256=', '')

  const expectedBuf = Buffer.from(expected, 'hex')
  const providedBuf = Buffer.from(provided, 'hex')
  if (expectedBuf.length !== providedBuf.length) return false
  return timingSafeEqual(expectedBuf, providedBuf)
}

// GET Handler for Meta Webhook Verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'unify_survey_bot_verify_token'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Meta Webhook Verified Successfully!')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST Handler for Inbound WhatsApp Messages
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()

    if (!isValidSignature(rawBody, req.headers.get('x-hub-signature-256'))) {
      console.error('Webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)

    const phoneNumber = extractPhoneNumber(body)
    const messageText = extractMessageText(body)

    if (phoneNumber && messageText) {
      console.log(`📩 Incoming message from ${phoneNumber}: "${messageText}"`)

      // Check if message text starts with START_SURVEY_ID pattern
      let surveyId: string | undefined
      if (messageText.startsWith('START_')) {
        surveyId = messageText.replace('START_', '')
      }

      // Process message through Survey Engine
      await handleIncomingMessage(phoneNumber, messageText, surveyId)
    }

    return NextResponse.json({ status: 'success' }, { status: 200 })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
