import { Link } from 'react-router-dom'
import { SIDEBAR_LOGO_SRC } from '@/lib/assets'
import { cn } from '@/lib/utils'

type SidebarBrandProps = {
  collapsed?: boolean
}

export function SidebarBrand({ collapsed = false }: SidebarBrandProps) {
  return (
    <Link
      to="/dashboard"
      className="bold-logo-trigger flex items-center gap-2.5 px-1 outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[#006AFE]/30"
    >
      <span className="bold-logo-wrap relative inline-flex shrink-0 overflow-hidden">
        <img
          src={SIDEBAR_LOGO_SRC}
          alt="Bold Support"
          className={cn(
            'bold-logo-img block w-auto object-contain object-left',
            collapsed ? 'h-7' : 'h-8',
          )}
        />
        <span
          aria-hidden
          className="bold-logo-shine pointer-events-none absolute inset-0 -translate-x-full"
        />
      </span>
      {!collapsed && (
        <p className="text-[11px] font-medium leading-tight text-gray-400 dark:text-gray-500">
          Central de atendimento
        </p>
      )}
    </Link>
  )
}
