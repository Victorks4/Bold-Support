import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-5', className)} {...props} />
}

export function Field({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />
}

export function FieldLabel({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      className={cn('text-sm font-medium leading-none text-gray-700 dark:text-gray-200', className)}
      {...props}
    />
  )
}

export function FieldError({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      role="alert"
      className={cn('text-xs font-medium text-red-600 dark:text-red-400', className)}
      {...props}
    />
  )
}

export function FormAlert({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300',
        className,
      )}
      {...props}
    />
  )
}
