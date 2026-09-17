import { NextRequest, NextResponse } from 'next/server'
import { extractMessageText, extractPhoneNumber } from '@/lib/whatsapp'
import { handleIncomingMessage } from '@/lib/survey-engine'

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
    const body = await req.json()

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
