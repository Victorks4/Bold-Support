import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-9 w-full min-w-0 rounded-md border border-border bg-white px-3 py-1 text-base text-gray-900 shadow-sm transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-700 dark:bg-[#1A2030] dark:text-gray-100 dark:placeholder:text-gray-500',
        className,
      )}
      {...props}
    />
  )
}
