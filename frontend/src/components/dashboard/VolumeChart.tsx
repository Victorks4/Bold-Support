import { Card, CardContent, CardHeader } from '@/components/ui/card'

type Bar = { label: string; value: number }

export function VolumeChart({ data }: { data: Bar[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <Card className="h-full">
      <CardHeader>
        <p className="text-app-heading text-sm font-bold">Volume semanal</p>
        <p className="text-app-muted text-xs">Chamados recebidos por dia</p>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end justify-between gap-2">
          {data.map((bar) => (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-blue-100 transition-all dark:bg-blue-900/40"
                style={{ height: `${(bar.value / max) * 100}%`, minHeight: 4 }}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">{bar.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
