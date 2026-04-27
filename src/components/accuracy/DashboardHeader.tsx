/**
 * Header component for the Accuracy Dashboard.
 * Contains navigation, view mode tabs, and filter controls.
 */

import { Link } from "@tanstack/react-router"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import {
  SAMPLE_SIZE_OPTIONS,
  MODEL_OPTIONS,
  type SampleSizeValue,
  type ModelValue,
} from "@/types/accuracy"

export type ViewMode = "dashboard" | "map" | "table" | "compare"

type DashboardHeaderProps = {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  selectedModel: ModelValue
  onModelChange: (model: ModelValue) => void
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  sampleSize: SampleSizeValue
  onSampleSizeChange: (size: SampleSizeValue) => void
  onFetchData: () => void
  isLoading: boolean
}

export function DashboardHeader({
  viewMode,
  onViewModeChange,
  selectedModel,
  onModelChange,
  dateRange,
  onDateRangeChange,
  sampleSize,
  onSampleSizeChange,
  onFetchData,
  isLoading,
}: DashboardHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b bg-background px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              Back to Prediction
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Model Accuracy Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Evaluate prediction accuracy using real Chicago crash data
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View mode toggle */}
          <Tabs
            value={viewMode}
            onValueChange={(v) => onViewModeChange(v as ViewMode)}
          >
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Model selector - only show when not in compare mode */}
          {viewMode !== "compare" && (
            <Select
              value={selectedModel}
              onValueChange={(v) => onModelChange(v as ModelValue)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODEL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date range picker */}
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            disabled={isLoading}
          />

          {/* Sample size selector */}
          <Select
            value={sampleSize.toString()}
            onValueChange={(v) =>
              onSampleSizeChange(Number(v) as SampleSizeValue)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fetch button */}
          <Button onClick={onFetchData} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading...
              </>
            ) : viewMode === "compare" ? (
              "Compare Models"
            ) : (
              "Fetch Data"
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
