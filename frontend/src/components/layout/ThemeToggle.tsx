import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  variant?: 'icon' | 'sidebar'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
        variant === 'icon' ? 'h-9 w-9' : 'h-9 w-full gap-2 px-2 text-xs font-medium',
        className,
      )}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      {variant === 'sidebar' && <span>{isDark ? 'Modo claro' : 'Modo escuro'}</span>}
    </button>
  )
}
