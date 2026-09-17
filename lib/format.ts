export function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

export function maskPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length <= 4) return `+${digits}`
  const prefixLen = Math.max(digits.length - 8, 3)
  const prefix = digits.slice(0, prefixLen)
  const last4 = digits.slice(-4)
  return `+${prefix} *** ${last4}`
}

export function whatsAppLink(surveyId: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  return `https://wa.me/${number}?text=${encodeURIComponent(`START_${surveyId}`)}`
}
