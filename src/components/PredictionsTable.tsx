/**
 * Predictions table with sorting and filtering using TanStack Table.
 */

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { PredictionWithActual } from "@/types/accuracy";
import { SEVERITY_COLORS, CORRECTNESS_COLORS } from "@/types/accuracy";

type PredictionsTableProps = {
  predictions: PredictionWithActual[];
};

// Format percentage
const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

// Format date
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "Unknown";
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
};

// Column definitions
const columns: ColumnDef<PredictionWithActual>[] = [
  {
    accessorKey: "crash_date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.crash_date),
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.crash_date;
      const b = rowB.original.crash_date;
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    },
  },
  {
    accessorKey: "predicted_severity",
    header: "Predicted",
    cell: ({ row }) => {
      const severity = row.original.predicted_severity;
      return (
        <Badge
          className={`${SEVERITY_COLORS[severity].bg} ${SEVERITY_COLORS[severity].text} text-xs`}
        >
          {severity.replace("_", " ")}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === "all") return true;
      return row.getValue(columnId) === filterValue;
    },
  },
  {
    accessorKey: "actual_severity",
    header: "Actual",
    cell: ({ row }) => {
      const severity = row.original.actual_severity;
      return (
        <Badge
          className={`${SEVERITY_COLORS[severity].bg} ${SEVERITY_COLORS[severity].text} text-xs`}
        >
          {severity.replace("_", " ")}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === "all") return true;
      return row.getValue(columnId) === filterValue;
    },
  },
  {
    accessorKey: "is_correct",
    header: "Result",
    cell: ({ row }) => {
      const isCorrect = row.original.is_correct;
      return (
        <Badge
          className={`${isCorrect ? CORRECTNESS_COLORS.correct.bg : CORRECTNESS_COLORS.incorrect.bg} ${isCorrect ? CORRECTNESS_COLORS.correct.text : CORRECTNESS_COLORS.incorrect.text} text-xs`}
        >
          {isCorrect ? "Correct" : "Wrong"}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      if (filterValue === "all") return true;
      return row.getValue(columnId) === (filterValue === "true");
    },
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => (
      <span className="font-mono">{formatPercent(row.original.confidence)}</span>
    ),
  },
  {
    accessorKey: "weather_condition",
    header: "Weather",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.weather_condition || "-"}
      </span>
    ),
  },
  {
    accessorKey: "lighting_condition",
    header: "Lighting",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.lighting_condition || "-"}
      </span>
    ),
  },
];

export function PredictionsTable({ predictions }: PredictionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Get filter values from column filters state
  const getFilterValue = (columnId: string): string => {
    const filter = columnFilters.find((f) => f.id === columnId);
    return (filter?.value as string) ?? "all";
  };

  // Set filter value for a column
  const setFilterValue = (columnId: string, value: string) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== columnId);
      if (value === "all") return existing;
      return [...existing, { id: columnId, value }];
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setColumnFilters([]);
  };

  const table = useReactTable({
    data: predictions,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredCount = table.getFilteredRowModel().rows.length;
  const hasFilters = columnFilters.length > 0;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-3 px-2">
        <span className="text-sm text-muted-foreground">Filter:</span>

        {/* Predicted severity filter */}
        <Select
          value={getFilterValue("predicted_severity")}
          onValueChange={(v) => setFilterValue("predicted_severity", v)}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Predicted" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Predicted</SelectItem>
            <SelectItem value="NO_INJURY">No Injury</SelectItem>
            <SelectItem value="MINOR">Minor</SelectItem>
            <SelectItem value="SEVERE">Severe</SelectItem>
          </SelectContent>
        </Select>

        {/* Actual severity filter */}
        <Select
          value={getFilterValue("actual_severity")}
          onValueChange={(v) => setFilterValue("actual_severity", v)}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Actual" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actual</SelectItem>
            <SelectItem value="NO_INJURY">No Injury</SelectItem>
            <SelectItem value="MINOR">Minor</SelectItem>
            <SelectItem value="SEVERE">Severe</SelectItem>
          </SelectContent>
        </Select>

        {/* Result filter */}
        <Select
          value={getFilterValue("is_correct")}
          onValueChange={(v) => setFilterValue("is_correct", v)}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="true">Correct</SelectItem>
            <SelectItem value="false">Wrong</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters button */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}

        {/* Count display */}
        <span className="ml-auto text-sm text-muted-foreground">
          {filteredCount} of {predictions.length} predictions
        </span>
      </div>

      {/* Table with native scrolling */}
      <div className="flex-1 min-h-0 overflow-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={`h-10 px-3 text-left align-middle font-medium text-foreground whitespace-nowrap ${canSort ? "cursor-pointer select-none hover:bg-muted/50" : ""}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {canSort && (
                          <span className="text-muted-foreground">
                            {sorted === "asc" ? " ^" : sorted === "desc" ? " v" : ""}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 align-middle whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No predictions match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
