/**
 * Confusion matrix visualization component.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccuracyMetrics } from "@/types/accuracy";

type ConfusionMatrixProps = {
  metrics: AccuracyMetrics;
};

export function ConfusionMatrix({ metrics }: ConfusionMatrixProps) {
  const { confusion_matrix, class_labels } = metrics;

  // Calculate row and column totals
  const rowTotals = confusion_matrix.map((row) =>
    row.reduce((sum, val) => sum + val, 0)
  );
  const colTotals = class_labels.map((_, colIdx) =>
    confusion_matrix.reduce((sum, row) => sum + row[colIdx], 0)
  );
  const total = rowTotals.reduce((sum, val) => sum + val, 0);

  // Get cell color based on whether it's on diagonal (correct) or off (incorrect)
  const getCellColor = (rowIdx: number, colIdx: number, value: number) => {
    if (value === 0) return "bg-gray-50 dark:bg-gray-900";

    const maxInRow = Math.max(...confusion_matrix[rowIdx]);
    const intensity = maxInRow > 0 ? value / maxInRow : 0;

    if (rowIdx === colIdx) {
      // Diagonal - correct predictions (green)
      if (intensity > 0.7) return "bg-green-200 dark:bg-green-900";
      if (intensity > 0.3) return "bg-green-100 dark:bg-green-950";
      return "bg-green-50 dark:bg-green-950/50";
    } else {
      // Off-diagonal - incorrect predictions (red)
      if (intensity > 0.7) return "bg-red-200 dark:bg-red-900";
      if (intensity > 0.3) return "bg-red-100 dark:bg-red-950";
      return "bg-red-50 dark:bg-red-950/50";
    }
  };

  // Short labels for display
  const shortLabels: Record<string, string> = {
    NO_INJURY: "None",
    MINOR: "Minor",
    SEVERE: "Severe",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Confusion Matrix</CardTitle>
        <p className="text-xs text-muted-foreground">
          Rows = Actual, Columns = Predicted
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-muted-foreground"></TableHead>
              {class_labels.map((label) => (
                <TableHead
                  key={label}
                  className="text-center text-muted-foreground"
                >
                  {shortLabels[label] || label}
                </TableHead>
              ))}
              <TableHead className="text-center text-muted-foreground">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {confusion_matrix.map((row, rowIdx) => (
              <TableRow key={class_labels[rowIdx]}>
                <TableCell className="font-medium text-muted-foreground">
                  {shortLabels[class_labels[rowIdx]] || class_labels[rowIdx]}
                </TableCell>
                {row.map((value, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className={`text-center ${getCellColor(rowIdx, colIdx, value)} border border-border/50`}
                  >
                    <span className="font-mono font-medium">{value}</span>
                    {rowTotals[rowIdx] > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({Math.round((value / rowTotals[rowIdx]) * 100)}%)
                      </span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-center font-medium bg-muted/30">
                  {rowTotals[rowIdx]}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2">
              <TableCell className="font-medium text-muted-foreground">
                Total
              </TableCell>
              {colTotals.map((colTotal, idx) => (
                <TableCell
                  key={idx}
                  className="text-center font-medium bg-muted/30"
                >
                  {colTotal}
                </TableCell>
              ))}
              <TableCell className="text-center font-bold bg-muted/50">
                {total}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-200 dark:bg-green-900" />
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-200 dark:bg-red-900" />
            <span>Incorrect</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
