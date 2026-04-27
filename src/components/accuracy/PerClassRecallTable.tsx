/**
 * Table showing per-class recall comparison across models.
 * Aggregates 5-class hierarchical metrics to 3-class for comparison.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  SEVERITY_COLORS,
  type ModelComparisonResponse,
  type ModelComparisonResult,
  type ClassMetrics,
} from "@/types/accuracy"

type PerClassRecallTableProps = {
  data: ModelComparisonResponse
}

// Mapping from 5-class to 3-class (based on backend SEVERITY_MAPPING)
const FIVE_TO_THREE_CLASS_MAPPING: Record<string, string> = {
  NO_INJURY: "NO_INJURY",
  REPORTED_NOT_EVIDENT: "MINOR",
  NONINCAPACITATING: "MINOR",
  INCAPACITATING: "SEVERE",
  FATAL: "SEVERE",
}

// Standard 3-class labels for comparison
const COMPARISON_LABELS = ["NO_INJURY", "MINOR", "SEVERE"] as const

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Aggregates 5-class metrics to 3-class by computing weighted recall.
 * Recall is aggregated by summing true positives and total samples per aggregated class.
 */
function aggregate5ClassTo3Class(
  perClassMetrics: Record<string, ClassMetrics>,
  classLabels: string[]
): Record<string, { recall: number; support: number; isAggregated: boolean }> {
  const is5Class = classLabels.some(
    (label) =>
      label === "REPORTED_NOT_EVIDENT" ||
      label === "NONINCAPACITATING" ||
      label === "INCAPACITATING" ||
      label === "FATAL"
  )

  if (!is5Class) {
    // Already 3-class, return as-is
    const result: Record<
      string,
      { recall: number; support: number; isAggregated: boolean }
    > = {}
    for (const label of COMPARISON_LABELS) {
      const metrics = perClassMetrics[label]
      if (metrics) {
        result[label] = {
          recall: metrics.recall,
          support: metrics.support,
          isAggregated: false,
        }
      }
    }
    return result
  }

  // Aggregate 5-class to 3-class
  // For recall: we need (true positives) / (total actual positives)
  // When aggregating, we sum the supports and compute weighted recall
  const aggregated: Record<string, { truePositives: number; support: number }> =
    {
      NO_INJURY: { truePositives: 0, support: 0 },
      MINOR: { truePositives: 0, support: 0 },
      SEVERE: { truePositives: 0, support: 0 },
    }

  for (const [label, metrics] of Object.entries(perClassMetrics)) {
    const targetClass = FIVE_TO_THREE_CLASS_MAPPING[label]
    if (targetClass && aggregated[targetClass]) {
      // recall = TP / (TP + FN) = TP / support
      // So TP = recall * support
      const truePositives = metrics.recall * metrics.support
      aggregated[targetClass].truePositives += truePositives
      aggregated[targetClass].support += metrics.support
    }
  }

  const result: Record<
    string,
    { recall: number; support: number; isAggregated: boolean }
  > = {}
  for (const label of COMPARISON_LABELS) {
    const agg = aggregated[label]
    result[label] = {
      recall: agg.support > 0 ? agg.truePositives / agg.support : 0,
      support: agg.support,
      isAggregated: true,
    }
  }

  return result
}

function getModelMetrics(model: ModelComparisonResult) {
  if (!model.metrics) return null

  return aggregate5ClassTo3Class(
    model.metrics.per_class_metrics,
    model.metrics.class_labels
  )
}

export function PerClassRecallTable({ data }: PerClassRecallTableProps) {
  const successfulModels = Object.values(data.models).filter(
    (m) => m.status === "success" && m.metrics
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Per-Class Recall Comparison
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Shows how well each model identifies each severity class (5-class
          metrics are aggregated to 3-class for comparison)
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Model</th>
                {COMPARISON_LABELS.map((label) => (
                  <th key={label} className="px-4 py-3 text-right font-medium">
                    <Badge
                      className={`${SEVERITY_COLORS[label]?.bg || "bg-gray-100"} ${SEVERITY_COLORS[label]?.text || "text-gray-800"}`}
                    >
                      {label.replace(/_/g, " ")}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {successfulModels.map((model) => {
                const metrics = getModelMetrics(model)
                const isAggregated = metrics
                  ? Object.values(metrics).some((m) => m.isAggregated)
                  : false

                return (
                  <tr
                    key={model.model_name}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {model.display_name}
                        {isAggregated && (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            Aggregated
                          </Badge>
                        )}
                      </div>
                    </td>
                    {COMPARISON_LABELS.map((label) => {
                      const classMetrics = metrics?.[label]
                      return (
                        <td key={label} className="px-4 py-3 text-right">
                          {classMetrics
                            ? formatPercent(classMetrics.recall)
                            : "-"}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
