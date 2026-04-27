/**
 * Table comparing metrics across multiple models.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ModelComparisonResponse } from "@/types/accuracy"

type ModelComparisonTableProps = {
  data: ModelComparisonResponse
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function ModelComparisonTable({ data }: ModelComparisonTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Model Comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Evaluated on {data.max_crashes.toLocaleString()} crashes from the last{" "}
          {data.time_range_days} days
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Model</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-right font-medium">Accuracy</th>
                <th className="px-4 py-3 text-right font-medium">F1 Macro</th>
                <th className="px-4 py-3 text-right font-medium">F1 Micro</th>
                <th className="px-4 py-3 text-right font-medium">Samples</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(data.models).map((model) => (
                <tr
                  key={model.model_name}
                  className="border-b hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-medium">
                    {model.display_name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">
                      {model.model_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {model.metrics
                      ? formatPercent(model.metrics.overall_accuracy)
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {model.metrics
                      ? formatPercent(model.metrics.f1_macro)
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {model.metrics
                      ? formatPercent(model.metrics.f1_micro)
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {model.metrics
                      ? model.metrics.sample_count.toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {model.status === "success" ? (
                      <Badge className="bg-green-100 text-green-800">
                        Success
                      </Badge>
                    ) : (
                      <Badge
                        className="bg-red-100 text-red-800"
                        title={model.error || undefined}
                      >
                        Error
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
