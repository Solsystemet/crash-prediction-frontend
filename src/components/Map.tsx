import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet"
import L from "leaflet"
import { ZoneLayer } from "./ZoneLayer"
import type { ZonePredictionResponse } from "@/types/prediction"

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

type MapProps = {
  /** Called when a zone is clicked */
  onZoneClick?: (zoneId: number) => void
  /** Currently selected zone ID */
  selectedZoneId?: number | null
  /** Map of zone ID to prediction result for coloring */
  zonePredictions?: Map<number, ZonePredictionResponse>
  /** Whether to show zone markers */
  showZones?: boolean
}

export default function Map({
  onZoneClick,
  selectedZoneId,
  zonePredictions,
  showZones = false,
}: MapProps) {
  return (
    <MapContainer
      center={[41.8781, -87.6298]}
      zoom={11}
      scrollWheelZoom={false}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="topright" />

      {/* Zone layer - only shown when zones model is active */}
      {showZones && (
        <ZoneLayer
          onZoneClick={onZoneClick}
          selectedZoneId={selectedZoneId}
          zonePredictions={zonePredictions}
        />
      )}

      {/* Default marker when zones are not shown */}
      {!showZones && (
        <Marker position={[41.8781, -87.6298]}>
          <Popup>Chicago, IL</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
