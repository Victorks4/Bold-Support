import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow: string
  title: string
  action?: ReactNode
}

export function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-xs font-bold tracking-[0.12em] text-[#006AFE] uppercase">{eyebrow}</p>
        <h1 className="text-app-heading text-2xl font-bold tracking-tight sm:text-[1.75rem]">{title}</h1>
      </div>
      {action}
    </div>
  )
}
