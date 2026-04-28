/**
 * Map view for accuracy dashboard showing prediction locations.
 */

import { lazy, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MapPrediction } from "@/types/accuracy"
import type { MapFilter } from "@/api/accuracy"

// Lazy load map component for better initial load
const AccuracyMap = lazy(() =>
  import("@/components/AccuracyMap").then((m) => ({ default: m.AccuracyMap }))
)

type AccuracyMapViewProps = {
  predictions: MapPrediction[]
  mapFilter: MapFilter
  onFilterChange: (filter: MapFilter) => void
  /** If true, renders as a preview (no filter controls) */
  isPreview?: boolean
}

function MapFallback() {
  return (
    <Card className="flex h-full items-center justify-center">
      <CardContent>Loading map...</CardContent>
    </Card>
  )
}

export function AccuracyMapView({
  predictions,
  mapFilter,
  onFilterChange,
  isPreview = false,
}: AccuracyMapViewProps) {
  if (isPreview) {
    return (
      <Suspense fallback={<MapFallback />}>
        <AccuracyMap predictions={predictions} isLoading={false} />
      </Suspense>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Map filter controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Show:</span>
        <Select
          value={mapFilter}
          onValueChange={(v) => onFilterChange(v as MapFilter)}
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
          {predictions.length} predictions shown
        </span>
      </div>

      <div className="flex-1">
        <Suspense fallback={<MapFallback />}>
          <AccuracyMap predictions={predictions} isLoading={false} />
        </Suspense>
      </div>
    </div>
  )
}
