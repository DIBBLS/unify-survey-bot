const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!

// Meta's Graph API returns a 200 with a JSON error body or a non-2xx status
// on failure (expired/invalid access token, wrong phone number id, unverified
// test recipient, etc.) — fetch() doesn't throw for either, so without this
// check a failed send is completely invisible: the webhook still acks 200 to
// Meta, and the respondent just never gets a reply.
async function postMessage(payload: Record<string, unknown>) {
  const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    console.error(`WhatsApp send failed (HTTP ${res.status}):`, JSON.stringify(data))
  }
  return data
}

export async function sendTextMessage(to: string, text: string) {
  return postMessage({ to, type: 'text', text: { body: text } })
}

export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  // WhatsApp interactive buttons (max 3)
  return postMessage({
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: 'reply',
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  })
}

export async function sendListMessage(
  to: string,
  bodyText: string,
  buttonLabel: string,
  sections: { title: string; rows: { id: string; title: string }[] }[]
) {
  // For >3 options, use a list message
  return postMessage({
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonLabel,
        sections,
      },
    },
  })
}

export type InboundKind = 'text' | 'media' | 'unknown'

export function extractMessageText(body: any): string | null {
  try {
    const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (!msg) return null
    if (msg.type === 'text') return msg.text?.body
    if (msg.type === 'interactive') {
      return (
        msg.interactive?.button_reply?.id ||
        msg.interactive?.list_reply?.id ||
        null
      )
    }
    return null
  } catch {
    return null
  }
}

export function extractPhoneNumber(body: any): string | null {
  try {
    return body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from ?? null
  } catch {
    return null
  }
}

export function extractMessageId(body: any): string | null {
  try {
    return body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id ?? null
  } catch {
    return null
  }
}

// What kind of inbound payload this is. 'text' covers plain text plus
// interactive replies that resolve to an answer id; 'media' covers
// image/audio/video/document/sticker/location/contacts (things the engine
// must answer with a "reply with text" prompt, not silence); 'unknown' is
// delivery receipts and anything else — ignored, only logged.
export function extractMessageKind(body: any): InboundKind {
  try {
    const msg = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    if (!msg || typeof msg.type !== 'string') return 'unknown'
    if (msg.type === 'text') return 'text'
    if (msg.type === 'interactive') {
      if (msg.interactive?.button_reply?.id || msg.interactive?.list_reply?.id) {
        return 'text'
      }
      return 'unknown'
    }
    if (
      ['image', 'audio', 'video', 'document', 'sticker', 'location', 'contacts'].includes(
        msg.type
      )
    ) {
      return 'media'
    }
    return 'unknown'
  } catch {
    return 'unknown'
  }
}
