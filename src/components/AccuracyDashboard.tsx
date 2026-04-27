/**
 * Accuracy Dashboard component.
 * Shows model accuracy metrics using real Chicago crash data.
 * Supports multiple models with comparison view.
 */

import { useState, useCallback } from "react"
import type { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfusionMatrix } from "@/components/ConfusionMatrix"
import { PredictionsTable } from "@/components/PredictionsTable"
import { ROCCurveChart } from "@/components/ROCCurveChart"
import {
  getAccuracyMetrics,
  getModelComparison,
  getROCData,
  getROCComparison,
  type MapFilter,
  type DateFilterOptions,
} from "@/api/accuracy"
import type {
  AccuracyResponse,
  PredictionWithActual,
  MapPrediction,
  ModelValue,
  ModelComparisonResponse,
  RocDataResponse,
  RocComparisonResponse,
  SampleSizeValue,
} from "@/types/accuracy"
import {
  DashboardHeader,
  MetricsSummaryCards,
  PerClassMetricsCard,
  ModelComparisonTable,
  PerClassRecallTable,
  AccuracyMapView,
  EmptyState,
  LoadingState,
  ErrorState,
  type ViewMode,
} from "@/components/accuracy"

// Default to last 7 days
const getDefaultDateRange = (): DateRange => ({
  from: subDays(new Date(), 7),
  to: new Date(),
})

export function AccuracyDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getDefaultDateRange()
  )
  const [sampleSize, setSampleSize] = useState<SampleSizeValue>(2000)
  const [selectedModel, setSelectedModel] =
    useState<ModelValue>("simplified_3class")
  const [data, setData] = useState<AccuracyResponse | null>(null)
  const [comparisonData, setComparisonData] =
    useState<ModelComparisonResponse | null>(null)
  const [rocData, setRocData] = useState<RocDataResponse | null>(null)
  const [rocComparisonData, setRocComparisonData] =
    useState<RocComparisonResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard")
  const [mapFilter, setMapFilter] = useState<MapFilter>("all")

  // Build date filter options from selected date range
  const getDateFilter = useCallback((): DateFilterOptions => {
    if (dateRange?.from && dateRange?.to) {
      return { dateRange: { from: dateRange.from, to: dateRange.to } }
    }
    // Fallback to 7 days if no range selected
    return { days: 7 }
  }, [dateRange])

  const fetchAccuracy = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const dateFilter = getDateFilter()

    try {
      if (viewMode === "compare") {
        // Fetch both comparison metrics and ROC data
        const [metricsResult, rocResult] = await Promise.all([
          getModelComparison(dateFilter, sampleSize),
          getROCComparison(dateFilter, sampleSize),
        ])
        setComparisonData(metricsResult)
        setRocComparisonData(rocResult)
        setData(null)
        setRocData(null)
      } else {
        // Fetch both accuracy metrics and ROC data for selected model
        const [metricsResult, rocResult] = await Promise.all([
          getAccuracyMetrics(dateFilter, sampleSize, selectedModel),
          getROCData(dateFilter, sampleSize, selectedModel),
        ])
        setData(metricsResult)
        setRocData(rocResult)
        setComparisonData(null)
        setRocComparisonData(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch accuracy")
      setData(null)
      setComparisonData(null)
      setRocData(null)
      setRocComparisonData(null)
    } finally {
      setIsLoading(false)
    }
  }, [getDateFilter, sampleSize, selectedModel, viewMode])

  // Get filtered predictions for map
  const getFilteredMapPredictions = (): MapPrediction[] => {
    if (!data) return []

    let filtered = data.predictions.filter(
      (
        p
      ): p is PredictionWithActual & { latitude: number; longitude: number } =>
        p.latitude !== null &&
        p.longitude !== null &&
        p.latitude > 41.6 &&
        p.latitude < 42.1 &&
        p.longitude > -88.0 &&
        p.longitude < -87.4
    )

    if (mapFilter === "correct") {
      filtered = filtered.filter((p) => p.is_correct)
    } else if (mapFilter === "incorrect") {
      filtered = filtered.filter((p) => !p.is_correct)
    }

    return filtered.map((p) => ({
      crash_record_id: p.crash_record_id,
      crash_date: p.crash_date,
      predicted_severity: p.predicted_severity,
      actual_severity: p.actual_severity,
      is_correct: p.is_correct,
      confidence: p.confidence,
      latitude: p.latitude,
      longitude: p.longitude,
      weather_condition: p.weather_condition,
      lighting_condition: p.lighting_condition,
    }))
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sampleSize={sampleSize}
        onSampleSizeChange={setSampleSize}
        onFetchData={fetchAccuracy}
        isLoading={isLoading}
      />

      {/* Main content */}
      <div className="flex-1 overflow-hidden p-4">
        {error && <ErrorState message={error} />}

        {!data && !comparisonData && !isLoading && !error && (
          <EmptyState isCompareMode={viewMode === "compare"} />
        )}

        {isLoading && <LoadingState />}

        {data && !isLoading && (
          <>
            {viewMode === "dashboard" && (
              <div
                className="grid h-full gap-4 lg:grid-cols-2"
                style={{ gridTemplateRows: "1fr" }}
              >
                {/* Left column: Metrics - scrollable */}
                <div className="min-h-0 overflow-y-auto pr-2">
                  <div className="flex flex-col gap-4">
                    <MetricsSummaryCards metrics={data.metrics} />
                    <PerClassMetricsCard
                      perClassMetrics={data.metrics.per_class_metrics}
                    />
                    <ConfusionMatrix metrics={data.metrics} />
                    <ROCCurveChart data={rocData} title="ROC Curves" />
                  </div>
                </div>

                {/* Right column: Map preview */}
                <div className="hidden min-h-0 lg:block">
                  <AccuracyMapView
                    predictions={getFilteredMapPredictions()}
                    mapFilter={mapFilter}
                    onFilterChange={setMapFilter}
                    isPreview
                  />
                </div>
              </div>
            )}

            {viewMode === "map" && (
              <AccuracyMapView
                predictions={getFilteredMapPredictions()}
                mapFilter={mapFilter}
                onFilterChange={setMapFilter}
              />
            )}

            {viewMode === "table" && (
              <Card className="flex h-full flex-col">
                <CardHeader className="flex-shrink-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Individual Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-2">
                  <PredictionsTable predictions={data.predictions} />
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Comparison View */}
        {viewMode === "compare" && comparisonData && !isLoading && (
          <div className="h-full min-h-0 overflow-y-auto">
            <div className="flex flex-col gap-4">
              <ModelComparisonTable data={comparisonData} />
              <PerClassRecallTable data={comparisonData} />
              <ROCCurveChart
                comparisonData={rocComparisonData}
                title="ROC Curves Comparison"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
