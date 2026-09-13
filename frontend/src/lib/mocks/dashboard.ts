export const dashboardStats = {
  abertos: { value: 24, delta: '+8%', trend: 'up' as const },
  emAtendimento: { value: 11, delta: '3 com você', trend: 'neutral' as const },
  slaMedio: { value: '1h 42', delta: '-12 min', trend: 'up' as const },
  resolvidosHoje: { value: 18, delta: '+21%', trend: 'up' as const },
}

export const volumeSemanal = [
  { label: 'S', value: 12 },
  { label: 'T', value: 18 },
  { label: 'Q', value: 15 },
  { label: 'Q', value: 22 },
  { label: 'S', value: 19 },
  { label: 'S', value: 8 },
  { label: 'D', value: 5 },
]

export const slaPercent = 86
