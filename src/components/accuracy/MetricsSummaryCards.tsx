/**
 * Summary cards showing key accuracy metrics.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AccuracyMetrics } from "@/types/accuracy"

type MetricsSummaryCardsProps = {
  metrics: AccuracyMetrics
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function MetricsSummaryCards({ metrics }: MetricsSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Overall Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(metrics.overall_accuracy)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            F1 Macro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(metrics.f1_macro)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            F1 Micro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercent(metrics.f1_micro)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Samples Evaluated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.sample_count.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Time Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.time_range_days} days
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
