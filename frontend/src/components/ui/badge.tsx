import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type BadgeProps = ComponentProps<'span'> & {
  variant?: 'default' | 'success' | 'info' | 'warning' | 'muted' | 'danger'
}

const variants = {
  default: 'bg-blue-50 text-[#006AFE]',
  success: 'bg-emerald-50 text-emerald-700',
  info: 'bg-sky-50 text-sky-700',
  warning: 'bg-amber-50 text-amber-700',
  muted: 'bg-gray-100 text-gray-600',
  danger: 'bg-red-50 text-red-600',
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
