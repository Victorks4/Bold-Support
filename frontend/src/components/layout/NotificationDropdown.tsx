import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAppData } from '@/lib/store/AppDataContext'
import { EVENTO_LABELS } from '@/lib/types/evento'
import { relativeTime } from '@/lib/utils/time'

export function NotificationDropdown() {
  const { eventos } = useAppData()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const recent = eventos.slice(0, 5)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        aria-label="Notificações"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {eventos.length > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-[min(100vw-2rem,320px)] rounded-2xl border border-gray-100 bg-white py-2 shadow-xl dark:border-gray-800 dark:bg-[#161B26]">
          <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-800">
            <p className="text-sm font-bold text-[#0E121D] dark:text-gray-100">Notificações</p>
            <p className="text-xs text-gray-500">Eventos do sistema (webhook simulado)</p>
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">Nenhum evento recente</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {recent.map((ev) => (
                <li key={ev.id} className="border-b border-gray-50 last:border-0">
                  <Link
                    to={`/chamados/${ev.ticket_id}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <p className="text-xs font-semibold text-[#006AFE]">{EVENTO_LABELS[ev.tipo]}</p>
                    <p className="text-xs text-gray-600">{ev.protocolo}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400">{relativeTime(ev.criado_em)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-gray-100 px-4 py-2">
            <Link
              to="/eventos"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#006AFE] hover:underline"
            >
              Ver todos os eventos →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
