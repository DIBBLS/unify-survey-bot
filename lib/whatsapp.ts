const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!

export async function sendTextMessage(to: string, text: string) {
  const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
  return res.json()
}

export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  // WhatsApp interactive buttons (max 3)
  const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
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
    }),
  })
  return res.json()
}

export async function sendListMessage(
  to: string,
  bodyText: string,
  buttonLabel: string,
  sections: { title: string; rows: { id: string; title: string }[] }[]
) {
  // For >3 options, use a list message
  const res = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
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
    }),
  })
  return res.json()
}

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
