/**
 * Accuracy Dashboard component.
 * Shows model accuracy metrics using real Chicago crash data.
 */

import { useState, useCallback, lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfusionMatrix } from "@/components/ConfusionMatrix";
import { PredictionsTable } from "@/components/PredictionsTable";
import { getAccuracyMetrics, type MapFilter } from "@/api/accuracy";
import type {
  AccuracyResponse,
  PredictionWithActual,
  TimeRangeValue,
  MapPrediction,
} from "@/types/accuracy";
import { TIME_RANGE_OPTIONS, SEVERITY_COLORS } from "@/types/accuracy";

// Lazy load map component for better initial load
const AccuracyMap = lazy(() =>
  import("@/components/AccuracyMap").then((m) => ({ default: m.AccuracyMap }))
);

type ViewMode = "dashboard" | "map" | "table";

export function AccuracyDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRangeValue>(7);
  const [data, setData] = useState<AccuracyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [mapFilter, setMapFilter] = useState<MapFilter>("all");

  const fetchAccuracy = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAccuracyMetrics(timeRange, 500);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch accuracy");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  // Get filtered predictions for map
  const getFilteredMapPredictions = (): MapPrediction[] => {
    if (!data) return [];

    let filtered = data.predictions.filter(
      (p): p is PredictionWithActual & { latitude: number; longitude: number } =>
        p.latitude !== null &&
        p.longitude !== null &&
        p.latitude > 41.6 &&
        p.latitude < 42.1 &&
        p.longitude > -88.0 &&
        p.longitude < -87.4
    );

    if (mapFilter === "correct") {
      filtered = filtered.filter((p) => p.is_correct);
    } else if (mapFilter === "incorrect") {
      filtered = filtered.filter((p) => !p.is_correct);
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
    }));
  };

  // Format percentage
  const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
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
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Time range selector */}
            <Select
              value={timeRange.toString()}
              onValueChange={(v) => setTimeRange(Number(v) as TimeRangeValue)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Fetch button */}
            <Button onClick={fetchAccuracy} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Loading...
                </>
              ) : (
                "Fetch Data"
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden p-4">
        {error && (
          <Card className="mb-4 border-destructive">
            <CardContent className="py-3">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!data && !isLoading && !error && (
          <Card className="flex h-full items-center justify-center">
            <CardContent>
              <div className="text-center">
                <p className="text-muted-foreground">
                  Click "Fetch Data" to load accuracy metrics from recent
                  Chicago crash data.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will fetch real crash data from the City of Chicago's
                  open data portal and compare model predictions against actual
                  outcomes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card className="flex h-full items-center justify-center">
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">
                  Fetching data from Chicago API...
                </p>
                <p className="text-sm text-muted-foreground">
                  This may take a moment for larger time ranges.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {data && !isLoading && (
          <>
            {viewMode === "dashboard" && (
              <div className="grid h-full gap-4 lg:grid-cols-2">
                {/* Left column: Metrics */}
                <div className="flex flex-col gap-4 overflow-auto">
                  {/* Summary cards */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                          Overall Accuracy
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatPercent(data.metrics.overall_accuracy)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                          Samples Evaluated
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {data.metrics.sample_count.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">
                          Time Range
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {data.metrics.time_range_days} days
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Per-class metrics */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Per-Class Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(data.metrics.per_class_metrics).map(
                          ([className, metrics]) => (
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
                                  <span className="text-muted-foreground">
                                    Precision:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {formatPercent(metrics.precision)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Recall:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {formatPercent(metrics.recall)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    F1:{" "}
                                  </span>
                                  <span className="font-medium">
                                    {formatPercent(metrics.f1_score)}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  n={metrics.support}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Confusion Matrix */}
                  <ConfusionMatrix metrics={data.metrics} />
                </div>

                {/* Right column: Map preview */}
                <div className="hidden lg:block">
                  <Suspense
                    fallback={
                      <Card className="flex h-full items-center justify-center">
                        <CardContent>Loading map...</CardContent>
                      </Card>
                    }
                  >
                    <AccuracyMap
                      predictions={getFilteredMapPredictions()}
                      isLoading={false}
                    />
                  </Suspense>
                </div>
              </div>
            )}

            {viewMode === "map" && (
              <div className="h-full flex flex-col gap-4">
                {/* Map filter controls */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select
                    value={mapFilter}
                    onValueChange={(v) => setMapFilter(v as MapFilter)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Predictions</SelectItem>
                      <SelectItem value="correct">Correct Only</SelectItem>
                      <SelectItem value="incorrect">Incorrect Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    {getFilteredMapPredictions().length} predictions shown
                  </span>
                </div>

                <div className="flex-1">
                  <Suspense
                    fallback={
                      <Card className="flex h-full items-center justify-center">
                        <CardContent>Loading map...</CardContent>
                      </Card>
                    }
                  >
                    <AccuracyMap
                      predictions={getFilteredMapPredictions()}
                      isLoading={false}
                    />
                  </Suspense>
                </div>
              </div>
            )}

            {viewMode === "table" && (
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 flex-shrink-0">
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
      </div>
    </div>
  );
}
