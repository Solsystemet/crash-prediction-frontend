/**
 * ROC Curve visualization component using Recharts.
 *
 * Displays ROC curves for classifier levels with AUC scores in the legend.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { RocCurve, RocDataResponse, RocComparisonResponse } from "@/types/accuracy";

type ROCCurveChartProps = {
  /** ROC data for a single model */
  data?: RocDataResponse | null;
  /** ROC data for comparison (multiple models) */
  comparisonData?: RocComparisonResponse | null;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Chart title */
  title?: string;
};

// Merge multiple curves into a single dataset for comparison
function mergeCurvesForComparison(
  curves: Array<{ name: string; color: string; curve: RocCurve }>
): Array<Record<string, number>> {
  // Create a unified x-axis (FPR values from 0 to 1)
  const fprValues = new Set<number>();
  curves.forEach(({ curve }) => {
    curve.fpr.forEach((v) => fprValues.add(Math.round(v * 100) / 100));
  });

  const sortedFpr = Array.from(fprValues).sort((a, b) => a - b);

  // For each FPR value, interpolate TPR for each curve
  return sortedFpr.map((fpr) => {
    const point: Record<string, number> = { fpr };

    curves.forEach(({ name, curve }) => {
      // Find the closest FPR points for interpolation
      let tpr = 0;
      for (let i = 0; i < curve.fpr.length; i++) {
        if (curve.fpr[i] <= fpr) {
          tpr = curve.tpr[i];
        } else {
          break;
        }
      }
      point[name] = Math.round(tpr * 1000) / 1000;
    });

    return point;
  });
}

export function ROCCurveChart({
  data,
  comparisonData,
  isLoading,
  title = "ROC Curves",
}: ROCCurveChartProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data && !comparisonData) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No ROC data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Single model view
  if (data && data.curves.length > 0) {
    const chartData = mergeCurvesForComparison(
      data.curves.map((curve) => ({
        name: curve.name,
        color: curve.color,
        curve,
      }))
    );

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Model: {data.model_name}
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="fpr"
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: "False Positive Rate", position: "bottom", offset: -5 }}
                fontSize={11}
              />
              <YAxis
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
                fontSize={11}
              />
              <Tooltip
                formatter={(value) => [(value as number).toFixed(3), "TPR"]}
                labelFormatter={(fpr) => `FPR: ${Number(fpr).toFixed(3)}`}
              />
              <Legend
                formatter={(value) => {
                  const curve = data.curves.find((c) => c.name === value);
                  return curve ? `${value} (AUC: ${curve.auc.toFixed(3)})` : value;
                }}
              />
              {/* Diagonal reference line (random classifier) */}
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                ]}
                stroke="#888"
                strokeDasharray="5 5"
                label={{ value: "Random", position: "insideBottomRight", fill: "#888", fontSize: 10 }}
              />
              {data.curves.map((curve) => (
                <Line
                  key={curve.name}
                  dataKey={curve.name}
                  stroke={curve.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  // Comparison view (multiple models)
  if (comparisonData) {
    // Collect all curves from successful models
    const allCurves: Array<{
      name: string;
      color: string;
      curve: RocCurve;
      modelName: string;
    }> = [];

    const modelColors = ["#3b82f6", "#f97316", "#22c55e", "#a855f7", "#ec4899"];
    let colorIdx = 0;

    Object.values(comparisonData.models).forEach((model) => {
      if (model.status === "success" && model.curves.length > 0) {
        // Use only L1 (Injury vs No Injury) for comparison
        const l1Curve = model.curves.find((c) => c.name.includes("L1") || c.name.includes("Injury"));
        if (l1Curve) {
          allCurves.push({
            name: model.display_name,
            color: modelColors[colorIdx % modelColors.length],
            curve: l1Curve,
            modelName: model.model_name,
          });
          colorIdx++;
        }
      }
    });

    if (allCurves.length === 0) {
      return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No ROC data available for comparison
            </div>
          </CardContent>
        </Card>
      );
    }

    const chartData = mergeCurvesForComparison(allCurves);

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Comparing L1 (Injury vs No Injury) across models
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="fpr"
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: "False Positive Rate", position: "bottom", offset: -5 }}
                fontSize={11}
              />
              <YAxis
                type="number"
                domain={[0, 1]}
                tickFormatter={(v) => v.toFixed(1)}
                label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }}
                fontSize={11}
              />
              <Tooltip
                formatter={(value, name) => [(value as number).toFixed(3), name]}
                labelFormatter={(fpr) => `FPR: ${Number(fpr).toFixed(3)}`}
              />
              <Legend
                formatter={(value) => {
                  const curveInfo = allCurves.find((c) => c.name === value);
                  return curveInfo ? `${value} (AUC: ${curveInfo.curve.auc.toFixed(3)})` : value;
                }}
              />
              {/* Diagonal reference line */}
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                ]}
                stroke="#888"
                strokeDasharray="5 5"
              />
              {allCurves.map((item) => (
                <Line
                  key={item.name}
                  dataKey={item.name}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return null;
}
