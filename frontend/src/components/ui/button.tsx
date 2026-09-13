import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'default' | 'outline'
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-[#1d6fd8]/30',
        variant === 'outline' && 'border bg-white dark:border-gray-700 dark:bg-[#161B26] dark:text-gray-100',
        className,
      )}
      {...props}
    />
  )
}
