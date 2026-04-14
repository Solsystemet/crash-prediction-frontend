/**
 * Component to display crash severity prediction results.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PredictionResponse, SeverityClass } from "@/types/prediction";

type PredictionResultProps = {
  result: PredictionResponse | null;
  isLoading: boolean;
  error: string | null;
};

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
};

function ProbabilityBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const percentage = Math.round(value * 100);

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
  );
}

export function PredictionResult({
  result,
  isLoading,
  error,
}: PredictionResultProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Prediction Result</CardTitle>
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
    );
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
    );
  }

  if (!result) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Prediction Result</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fill in the crash parameters and click "Predict" to see the severity
            prediction.
          </p>
        </CardContent>
      </Card>
    );
  }

  const config = severityConfig[result.prediction];

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
  );
}
