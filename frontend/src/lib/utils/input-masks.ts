import { TELEFONE_MAX_DIGITS } from '@/lib/constants/field-limits'

/** Mantém apenas dígitos, limitado ao máximo informado. */
export function sanitizeTelefoneInput(raw: string, maxDigits = TELEFONE_MAX_DIGITS): string {
  return raw.replace(/\D/g, '').slice(0, maxDigits)
}

/** Formata telefone brasileiro para exibição durante a digitação. */
export function formatTelefoneDisplay(digits: string): string {
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export function clampText(raw: string, maxLength: number): string {
  return raw.length <= maxLength ? raw : raw.slice(0, maxLength)
}
