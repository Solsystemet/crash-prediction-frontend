/**
 * Zone selector component for picking zones by ID or selecting all zones.
 */

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getZones } from "@/api/prediction"
import type { ZoneInfo } from "@/types/prediction"

type ZoneSelectorProps = {
  /** Currently selected zone ID (null = all zones, undefined = none) */
  selectedZoneId: number | null | undefined
  /** Called when zone selection changes */
  onZoneChange: (zoneId: number | null) => void
  /** Called when "Predict All Zones" is requested */
  onPredictAllZones?: () => void
  /** Whether all-zones prediction is loading */
  isLoading?: boolean
}

export function ZoneSelector({
  selectedZoneId,
  onZoneChange,
}: ZoneSelectorProps) {
  const [zones, setZones] = useState<ZoneInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch zones on mount
  useEffect(() => {
    let mounted = true

    async function fetchZones() {
      try {
        const response = await getZones()
        if (mounted) {
          setZones(response.zones)
        }
      } catch (err) {
        console.error("Failed to load zones:", err)
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

  const handleValueChange = (value: string) => {
    if (value === "all") {
      onZoneChange(null)
    } else {
      onZoneChange(parseInt(value, 10))
    }
  }

  // Determine the select value
  const selectValue =
    selectedZoneId === null ? "all" : (selectedZoneId?.toString() ?? "")

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Select Zone</Label>
        <Select
          value={selectValue}
          onValueChange={handleValueChange}
          disabled={loading}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue
              placeholder={loading ? "Loading zones..." : "Select a zone"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs font-medium">
              All Zones (Predict All)
            </SelectItem>
            {zones.map((zone) => (
              <SelectItem
                key={zone.zone_id}
                value={zone.zone_id.toString()}
                className="text-xs"
              >
                Zone {zone.zone_id}{" "}
                <span className="text-muted-foreground">
                  ({zone.center[0].toFixed(3)}, {zone.center[1].toFixed(3)})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedZoneId !== undefined && selectedZoneId !== null && (
        <div className="rounded-md bg-muted/50 p-2 text-xs">
          <div className="font-medium">Zone {selectedZoneId}</div>
          {zones.find((z) => z.zone_id === selectedZoneId) && (
            <div className="text-muted-foreground">
              Center:{" "}
              {zones
                .find((z) => z.zone_id === selectedZoneId)
                ?.center[0].toFixed(4)}
              ,{" "}
              {zones
                .find((z) => z.zone_id === selectedZoneId)
                ?.center[1].toFixed(4)}
            </div>
          )}
          <p className="mt-1 text-muted-foreground">
            Click "Predict" to get severity prediction for this zone
          </p>
        </div>
      )}

      {selectedZoneId === null && (
        <div className="rounded-md bg-muted/50 p-2 text-xs">
          <div className="font-medium">All Zones Selected</div>
          <p className="text-muted-foreground">
            Click "Predict" to get predictions for all {zones.length} zones
          </p>
        </div>
      )}

      {selectedZoneId === undefined && (
        <p className="text-xs text-muted-foreground">
          Select a zone from the dropdown or click on a zone on the map
        </p>
      )}
    </div>
  )
}

export default ZoneSelector
