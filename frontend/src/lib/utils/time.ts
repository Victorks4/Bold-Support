export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `Há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Há ${hours}h`
  const days = Math.floor(hours / 24)
  return `Há ${days} dia${days > 1 ? 's' : ''}`
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
