/**
 * Component to display crash prediction results for all model types.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type {
  AnyPredictionResponse,
  SeverityClass,
  HierarchicalSeverityClass,
  ModelType,
  HierarchicalPredictionResponse,
} from "@/types/prediction"
import {
  isRegressionResponse,
  isZoneResponse,
  isHierarchicalResponse,
} from "@/types/prediction"

type PredictionResultProps = {
  result: AnyPredictionResponse | null
  isLoading: boolean
  error: string | null
  modelType?: ModelType
}

const severityConfig: Record<
  SeverityClass,
  { label: string; color: string; bgColor: string; description: string }
> = {
  NO_INJURY: {
    label: "No Injury",
    color: "text-green-700",
    bgColor: "bg-green-100",
    description: "No indication of injury expected",
  },
  MINOR: {
    label: "Minor",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    description: "Non-incapacitating or reported injury expected",
  },
  SEVERE: {
    label: "Severe",
    color: "text-red-700",
    bgColor: "bg-red-100",
    description: "Fatal or incapacitating injury expected",
  },
}

// 5-class hierarchical severity config
const hierarchicalSeverityConfig: Record<
  HierarchicalSeverityClass,
  { label: string; color: string; bgColor: string; description: string }
> = {
  NO_INJURY: {
    label: "No Injury",
    color: "text-green-700",
    bgColor: "bg-green-100",
    description: "No indication of injury",
  },
  REPORTED_NOT_EVIDENT: {
    label: "Reported",
    color: "text-lime-700",
    bgColor: "bg-lime-100",
    description: "Reported injury, not evident",
  },
  NONINCAPACITATING: {
    label: "Non-Incapacitating",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    description: "Visible but non-incapacitating injury",
  },
  INCAPACITATING: {
    label: "Incapacitating",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    description: "Incapacitating injury",
  },
  FATAL: {
    label: "Fatal",
    color: "text-red-700",
    bgColor: "bg-red-100",
    description: "Fatal injury",
  },
}

function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const percentage = Math.round(value * 100)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function RegressionResultDisplay({
  result,
}: {
  result: AnyPredictionResponse
}) {
  if (!isRegressionResponse(result)) return null

  const count = result.predicted_count
  const [lower, upper] = result.confidence_interval

  // Color based on predicted count
  let riskLevel: "low" | "medium" | "high"
  let bgColor: string
  let textColor: string

  if (count < 3) {
    riskLevel = "low"
    bgColor = "bg-green-100"
    textColor = "text-green-700"
  } else if (count < 7) {
    riskLevel = "medium"
    bgColor = "bg-yellow-100"
    textColor = "text-yellow-700"
  } else {
    riskLevel = "high"
    bgColor = "bg-red-100"
    textColor = "text-red-700"
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Crash Count Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4">
          <div className={`text-3xl font-bold ${textColor}`}>
            {count.toFixed(1)}
          </div>
          <Badge className={`${bgColor} ${textColor} text-sm`}>
            {riskLevel === "low" && "Low Risk"}
            {riskLevel === "medium" && "Medium Risk"}
            {riskLevel === "high" && "High Risk"}
          </Badge>
          <p className="text-center text-xs text-muted-foreground">
            Expected crashes per {result.time_period}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            95% Confidence Interval
          </p>
          <div className="flex justify-between text-sm">
            <span>{lower.toFixed(1)}</span>
            <span className="text-muted-foreground">to</span>
            <span>{upper.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Model: {result.model_name}
        </p>
      </CardContent>
    </Card>
  )
}

function SeverityResultDisplay({
  result,
  showZoneInfo = false,
}: {
  result: AnyPredictionResponse
  showZoneInfo?: boolean
}) {
  if (isRegressionResponse(result) || isHierarchicalResponse(result))
    return null

  const config = severityConfig[result.prediction]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Prediction Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main prediction */}
        <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4">
          <Badge className={`${config.bgColor} ${config.color} text-sm`}>
            {config.label}
          </Badge>
          <p className="text-center text-xs text-muted-foreground">
            {config.description}
          </p>
          <p className="text-xs text-muted-foreground">
            Confidence: {Math.round(result.confidence * 100)}%
          </p>
        </div>

        {/* Zone information */}
        {showZoneInfo && isZoneResponse(result) && (
          <div className="space-y-1 rounded-lg border p-3">
            <p className="text-xs font-medium">Zone Information</p>
            <p className="text-xs text-muted-foreground">
              Zone ID: {result.zone_id}
            </p>
            <p className="text-xs text-muted-foreground">
              Center: {result.zone_center[0].toFixed(4)},{" "}
              {result.zone_center[1].toFixed(4)}
            </p>
          </div>
        )}

        {/* Probability breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Probability Breakdown
          </p>
          <ProbabilityBar
            label="No Injury"
            value={result.probabilities.no_injury}
            color="bg-green-500"
          />
          <ProbabilityBar
            label="Minor"
            value={result.probabilities.minor}
            color="bg-yellow-500"
          />
          <ProbabilityBar
            label="Severe"
            value={result.probabilities.severe}
            color="bg-red-500"
          />
        </div>

        {/* Model info */}
        <p className="text-xs text-muted-foreground">
          Model: {result.model_name}
        </p>
      </CardContent>
    </Card>
  )
}

function HierarchicalResultDisplay({
  result,
}: {
  result: HierarchicalPredictionResponse
}) {
  const config = hierarchicalSeverityConfig[result.prediction]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          5-Class Prediction Result
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main prediction */}
        <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4">
          <Badge className={`${config.bgColor} ${config.color} text-sm`}>
            {config.label}
          </Badge>
          <p className="text-center text-xs text-muted-foreground">
            {config.description}
          </p>
          <p className="text-xs text-muted-foreground">
            Confidence: {Math.round(result.confidence * 100)}%
          </p>
        </div>

        {/* Probability breakdown - 5 classes */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            Probability Breakdown
          </p>
          <ProbabilityBar
            label="No Injury"
            value={result.probabilities.no_injury}
            color="bg-green-500"
          />
          <ProbabilityBar
            label="Reported"
            value={result.probabilities.reported_not_evident}
            color="bg-lime-500"
          />
          <ProbabilityBar
            label="Non-Incapacitating"
            value={result.probabilities.nonincapacitating}
            color="bg-yellow-500"
          />
          <ProbabilityBar
            label="Incapacitating"
            value={result.probabilities.incapacitating}
            color="bg-orange-500"
          />
          <ProbabilityBar
            label="Fatal"
            value={result.probabilities.fatal}
            color="bg-red-500"
          />
        </div>

        {/* Model info */}
        <p className="text-xs text-muted-foreground">
          Model: {result.model_name}
        </p>
      </CardContent>
    </Card>
  )
}

export function PredictionResult({
  result,
  isLoading,
  error,
  modelType = "simplified",
}: PredictionResultProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Prediction Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">
              Analyzing...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-destructive">
            Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    const placeholder =
      modelType === "regression"
        ? 'Fill in the parameters and click "Predict" to see the expected crash count.'
        : 'Fill in the crash parameters and click "Predict" to see the severity prediction.'

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Prediction Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{placeholder}</p>
        </CardContent>
      </Card>
    )
  }

  // Render based on response type
  if (isRegressionResponse(result)) {
    return <RegressionResultDisplay result={result} />
  }

  if (isHierarchicalResponse(result)) {
    return <HierarchicalResultDisplay result={result} />
  }

  return (
    <SeverityResultDisplay
      result={result}
      showZoneInfo={modelType === "zones"}
    />
  )
}
