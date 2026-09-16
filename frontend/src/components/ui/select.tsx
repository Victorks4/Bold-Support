import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

function parseOptions(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.type !== 'option') return

    const props = (child as ReactElement<ComponentProps<'option'>>).props
    const label =
      typeof props.children === 'string' || typeof props.children === 'number'
        ? String(props.children)
        : ''

    options.push({
      value: props.value == null ? '' : String(props.value),
      label,
      disabled: props.disabled,
    })
  })

  return options
}

type SelectProps = Omit<ComponentProps<'select'>, 'onChange'> & {
  onChange?: (event: { target: { value: string } }) => void
}

export function Select({
  className,
  value,
  onChange,
  children,
  disabled,
  id,
  'aria-invalid': ariaInvalid,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const options = useMemo(() => parseOptions(children), [children])

  const selectedValue = value == null ? '' : String(value)
  const selected = options.find((option) => option.value === selectedValue)
  const placeholder = options[0]?.label ?? 'Selecione'

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function selectOption(nextValue: string) {
    onChange?.({ target: { value: nextValue } })
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        onClick={() => !disabled && setOpen((current) => !current)}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 text-left text-sm text-gray-900 outline-none transition-[border-color,box-shadow,transform] duration-200',
          'hover:border-gray-300 focus:border-[#006AFE] focus:ring-2 focus:ring-[#006AFE]/15',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-gray-700 dark:bg-[#1A2030] dark:text-gray-100 dark:hover:border-gray-600',
          ariaInvalid && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          open && 'border-[#006AFE] ring-2 ring-[#006AFE]/15',
          className,
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ease-out',
            open && 'rotate-180 text-[#006AFE]',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-[calc(100%+6px)] z-50 w-full origin-top"
          >
            <ul
              role="listbox"
              aria-labelledby={id}
              className="max-h-56 overflow-auto rounded-xl border border-gray-200/80 bg-white p-1 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.28)] dark:border-gray-700 dark:bg-[#1A2030] dark:shadow-black/40"
            >
              {options.map((option) => {
                const isSelected = option.value === selectedValue
                return (
                  <li key={`${option.value}-${option.label}`} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => !option.disabled && selectOption(option.value)}
                      className={cn(
                        'flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150',
                        'hover:bg-gray-50 dark:hover:bg-white/5',
                        isSelected && 'bg-[#006AFE]/10 font-medium text-[#006AFE] dark:bg-[#006AFE]/20',
                        option.disabled && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      {option.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
