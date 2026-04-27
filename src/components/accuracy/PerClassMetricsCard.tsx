/**
 * Card showing per-class precision, recall, and F1 metrics.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SEVERITY_COLORS, type ClassMetrics } from "@/types/accuracy"

type PerClassMetricsCardProps = {
  perClassMetrics: Record<string, ClassMetrics>
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function PerClassMetricsCard({
  perClassMetrics,
}: PerClassMetricsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Per-Class Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(perClassMetrics).map(([className, metrics]) => (
            <div
              key={className}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <Badge
                className={`${SEVERITY_COLORS[className as keyof typeof SEVERITY_COLORS]?.bg || "bg-gray-100"} ${SEVERITY_COLORS[className as keyof typeof SEVERITY_COLORS]?.text || "text-gray-800"}`}
              >
                {className.replace("_", " ")}
              </Badge>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Precision: </span>
                  <span className="font-medium">
                    {formatPercent(metrics.precision)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Recall: </span>
                  <span className="font-medium">
                    {formatPercent(metrics.recall)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">F1: </span>
                  <span className="font-medium">
                    {formatPercent(metrics.f1_score)}
                  </span>
                </div>
                <div className="text-muted-foreground">n={metrics.support}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
