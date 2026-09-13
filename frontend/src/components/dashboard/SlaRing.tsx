import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function SlaRing({ percent }: { percent: number }) {
  const r = 40
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c

  return (
    <Card className="h-full">
      <CardHeader>
        <p className="text-app-heading text-sm font-bold">Cumprimento de SLA</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="#00E676"
              strokeWidth="10"
              strokeDasharray={c}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <span className="text-app-heading absolute inset-0 flex items-center justify-center text-xl font-bold">
            {percent}%
          </span>
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">SLA saudável</p>
        <p className="text-app-muted mt-1 text-center text-xs">
          21 de 24 chamados dentro do prazo acordado.
        </p>
      </CardContent>
    </Card>
  )
}
