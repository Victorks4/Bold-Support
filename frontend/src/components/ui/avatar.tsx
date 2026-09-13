import { cn } from '@/lib/utils'

type AvatarProps = {
  initials: string
  className?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal'
}

const colors = {
  blue: 'bg-blue-100 text-[#006AFE]',
  green: 'bg-emerald-100 text-emerald-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  teal: 'bg-teal-100 text-teal-700',
}

export function Avatar({ initials, className, color = 'blue' }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
        colors[color],
        className,
      )}
    >
      {initials}
    </span>
  )
}
