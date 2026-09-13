import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#006AFE] focus:ring-2 focus:ring-[#006AFE]/15 dark:border-gray-700 dark:bg-[#1A2030] dark:text-gray-100 dark:placeholder:text-gray-500',
        className,
      )}
      {...props}
    />
  )
}
