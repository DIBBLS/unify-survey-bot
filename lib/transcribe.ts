// Speech-to-text for voice-note answers.
//
// Uses any OpenAI-compatible /audio/transcriptions endpoint. Defaults to
// Groq's hosted Whisper (fast, cheap, good with Nigerian-accented English).
// Swap provider by changing TRANSCRIBE_API_URL / TRANSCRIBE_MODEL, e.g.
//   OpenAI: https://api.openai.com/v1/audio/transcriptions + whisper-1
//
// Returns null on any failure — the caller falls back to asking for text,
// so a transcription outage never breaks a survey.

const API_URL =
  process.env.TRANSCRIBE_API_URL || 'https://api.groq.com/openai/v1/audio/transcriptions'
const MODEL = process.env.TRANSCRIBE_MODEL || 'whisper-large-v3-turbo'

export function isTranscriptionEnabled(): boolean {
  return Boolean(process.env.TRANSCRIBE_API_KEY)
}

export async function transcribeAudio(
  audio: ArrayBuffer,
  mimeType: string
): Promise<string | null> {
  const key = process.env.TRANSCRIBE_API_KEY
  if (!key) return null
  try {
    // WhatsApp voice notes are Ogg/Opus; the API infers format from the name.
    const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mpeg') ? 'mp3'
      : mimeType.includes('mp4') || mimeType.includes('aac') ? 'm4a' : 'ogg'
    const form = new FormData()
    form.append('file', new Blob([audio], { type: mimeType }), `voice.${ext}`)
    form.append('model', MODEL)
    form.append('response_format', 'json')

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    })
    const data = await res.json().catch(() => null)
    if (!res.ok || !data?.text) {
      console.error(`Transcription failed (HTTP ${res.status}):`, JSON.stringify(data))
      return null
    }
    const text = String(data.text).trim()
    return text.length > 0 ? text : null
  } catch (err) {
    console.error('Transcription error:', err)
    return null
  }
}
