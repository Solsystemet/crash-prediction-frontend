/**
 * Map layer for displaying and interacting with geographic zones.
 * Renders zones as Voronoi polygons showing actual zone boundaries.
 */

import { useEffect, useState, useMemo } from "react"
import { Polygon, Popup, CircleMarker } from "react-leaflet"
import { Delaunay } from "d3-delaunay"
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

// Chicago bounding box for Voronoi clipping
// Slightly expanded to ensure full coverage
const CHICAGO_BOUNDS = {
  minLng: -87.95,
  maxLng: -87.5,
  minLat: 41.64,
  maxLat: 42.03,
}

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

type VoronoiZone = {
  zone: ZoneInfo
  polygon: [number, number][] // [lat, lng] pairs for Leaflet
}

/**
 * Compute Voronoi polygons for zone centroids.
 * Returns polygons clipped to Chicago bounds.
 */
function computeVoronoiPolygons(zones: ZoneInfo[]): VoronoiZone[] {
  if (zones.length === 0) return []

  // d3-delaunay uses [x, y] = [lng, lat] ordering
  const points = zones.map((z) => [z.center[1], z.center[0]] as [number, number])

  // Create Delaunay triangulation and Voronoi diagram
  const delaunay = Delaunay.from(points)
  const voronoi = delaunay.voronoi([
    CHICAGO_BOUNDS.minLng,
    CHICAGO_BOUNDS.minLat,
    CHICAGO_BOUNDS.maxLng,
    CHICAGO_BOUNDS.maxLat,
  ])

  // Extract polygons for each zone
  return zones.map((zone, i) => {
    const cellPolygon = voronoi.cellPolygon(i)

    // Convert from [lng, lat] to [lat, lng] for Leaflet
    const polygon: [number, number][] = cellPolygon
      ? cellPolygon.map(([lng, lat]) => [lat, lng] as [number, number])
      : []

    return { zone, polygon }
  })
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

  // Compute Voronoi polygons when zones change
  const voronoiZones = useMemo(() => computeVoronoiPolygons(zones), [zones])

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
      return 0.5
    }
    if (zonePredictions?.has(zoneId)) {
      return 0.4
    }
    return 0.2
  }

  if (!visible) {
    return null
  }

  if (loading) {
    return null
  }

  if (error) {
    console.warn("Zone layer error:", error)
    return null
  }

  return (
    <>
      {/* Render Voronoi polygons */}
      {voronoiZones.map(({ zone, polygon }) => {
        if (polygon.length === 0) return null

        const color = getZoneColor(zone.zone_id)
        const isSelected = selectedZoneId === zone.zone_id

        return (
          <Polygon
            key={`polygon-${zone.zone_id}`}
            positions={polygon}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: getZoneFillOpacity(zone.zone_id),
              weight: isSelected ? 3 : 1.5,
              opacity: isSelected ? 1 : 0.8,
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
                  Center: {zone.center[0].toFixed(4)}, {zone.center[1].toFixed(4)}
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
                    <div className="mt-1 text-xs text-muted-foreground">
                      Confidence:{" "}
                      {(
                        zonePredictions.get(zone.zone_id)!.confidence * 100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Polygon>
        )
      })}

      {/* Render small markers at zone centers for reference */}
      {zones.map((zone) => (
        <CircleMarker
          key={`center-${zone.zone_id}`}
          center={[zone.center[0], zone.center[1]]}
          radius={4}
          pathOptions={{
            color: "#1f2937", // gray-800
            fillColor: "#ffffff",
            fillOpacity: 0.9,
            weight: 1,
          }}
        />
      ))}
    </>
  )
}

export default ZoneLayer
