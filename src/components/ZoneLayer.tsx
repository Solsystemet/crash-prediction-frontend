/**
 * Map layer for displaying and interacting with geographic zones.
 * Renders zones as clickable circles at their centroids.
 */

import { useEffect, useState } from "react"
import { CircleMarker, Popup, useMap } from "react-leaflet"
import { getZones } from "@/api/prediction"
import type {
  ZoneInfo,
  ZonePredictionResponse,
  SeverityClass,
} from "@/types/prediction"

// Severity colors for zone visualization
const SEVERITY_COLORS: Record<SeverityClass, string> = {
  NO_INJURY: "#22c55e", // green-500
  MINOR: "#eab308", // yellow-500
  SEVERE: "#ef4444", // red-500
}

const DEFAULT_ZONE_COLOR = "#3b82f6" // blue-500
const SELECTED_ZONE_COLOR = "#8b5cf6" // violet-500

type ZoneLayerProps = {
  /** Called when a zone is clicked */
  onZoneClick?: (zoneId: number) => void
  /** Currently selected zone ID */
  selectedZoneId?: number | null
  /** Map of zone ID to prediction result for coloring */
  zonePredictions?: Map<number, ZonePredictionResponse>
  /** Whether to show zones (controlled from parent) */
  visible?: boolean
}

export function ZoneLayer({
  onZoneClick,
  selectedZoneId,
  zonePredictions,
  visible = true,
}: ZoneLayerProps) {
  const [zones, setZones] = useState<ZoneInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const map = useMap()

  // Fetch zones on mount
  useEffect(() => {
    let mounted = true

    async function fetchZones() {
      try {
        setLoading(true)
        setError(null)
        const response = await getZones()
        if (mounted) {
          setZones(response.zones)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load zones")
          console.error("Failed to load zones:", err)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchZones()

    return () => {
      mounted = false
    }
  }, [])

  // Get color for a zone based on its prediction or selection state
  const getZoneColor = (zoneId: number): string => {
    if (selectedZoneId === zoneId) {
      return SELECTED_ZONE_COLOR
    }

    if (zonePredictions?.has(zoneId)) {
      const prediction = zonePredictions.get(zoneId)!
      return SEVERITY_COLORS[prediction.prediction]
    }

    return DEFAULT_ZONE_COLOR
  }

  // Get fill opacity based on selection
  const getZoneFillOpacity = (zoneId: number): number => {
    if (selectedZoneId === zoneId) {
      return 0.6
    }
    if (zonePredictions?.has(zoneId)) {
      return 0.5
    }
    return 0.3
  }

  if (!visible) {
    return null
  }

  if (loading) {
    return null // Could show loading indicator
  }

  if (error) {
    console.warn("Zone layer error:", error)
    return null
  }

  return (
    <>
      {zones.map((zone) => (
        <CircleMarker
          key={zone.zone_id}
          center={[zone.center[0], zone.center[1]]}
          radius={20}
          pathOptions={{
            color: getZoneColor(zone.zone_id),
            fillColor: getZoneColor(zone.zone_id),
            fillOpacity: getZoneFillOpacity(zone.zone_id),
            weight: selectedZoneId === zone.zone_id ? 3 : 2,
          }}
          eventHandlers={{
            click: () => {
              onZoneClick?.(zone.zone_id)
            },
          }}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">Zone {zone.zone_id}</div>
              <div className="text-xs text-muted-foreground">
                {zone.center[0].toFixed(4)}, {zone.center[1].toFixed(4)}
              </div>
              {zonePredictions?.has(zone.zone_id) && (
                <div className="mt-1">
                  <span
                    className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
                    style={{
                      backgroundColor:
                        SEVERITY_COLORS[
                          zonePredictions.get(zone.zone_id)!.prediction
                        ],
                    }}
                  >
                    {zonePredictions.get(zone.zone_id)!.prediction}
                  </span>
                </div>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}

export default ZoneLayer
