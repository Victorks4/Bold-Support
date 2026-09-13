export function BoldBrand({ variant = 'inline' }: { variant?: 'inline' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <img
        src="/images/logo-bold.svg"
        alt="Bold Support"
        className="h-8 w-auto"
      />
    )
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src="/images/logo-bold.svg"
        alt="Bold Support"
        className="h-10 w-auto shrink-0"
      />
      <div className="text-left">
        <p className="text-sm font-semibold text-black">Bold Support</p>
        <p className="text-xs text-gray-500">Central de chamados</p>
      </div>
    </div>
  )
}
