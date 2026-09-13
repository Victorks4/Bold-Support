import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type StatCardProps = {
  label: string
  value: string | number
  delta: string
  trend: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, delta, trend }: StatCardProps) {
  const TrendIcon = trend === 'down' ? ArrowDownRight : ArrowUpRight
  const deltaColor =
    trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 'text-app-muted'

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <p className="text-app-muted text-sm font-medium">{label}</p>
          {trend !== 'neutral' && <TrendIcon className="h-4 w-4 text-gray-300 dark:text-gray-600" />}
        </div>
        <p className="text-app-heading mt-2 text-3xl font-bold">{value}</p>
        <p className={`mt-1 text-xs font-medium ${deltaColor}`}>{delta}</p>
      </CardContent>
    </Card>
  )
}
