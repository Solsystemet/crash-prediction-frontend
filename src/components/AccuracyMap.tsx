/**
 * Map visualization for prediction accuracy.
 * Shows crash locations with markers colored by prediction correctness.
 */

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { MapPrediction } from "@/types/accuracy";
import { SEVERITY_COLORS, CORRECTNESS_COLORS } from "@/types/accuracy";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

type AccuracyMapProps = {
  predictions: MapPrediction[];
  isLoading?: boolean;
};

export function AccuracyMap({ predictions, isLoading }: AccuracyMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Chicago center coordinates
  const chicagoCenter: [number, number] = [41.8781, -87.6298];

  // Get marker color based on correctness
  const getMarkerColor = (isCorrect: boolean) => {
    return isCorrect
      ? CORRECTNESS_COLORS.correct.hex
      : CORRECTNESS_COLORS.incorrect.hex;
  };

  // Get marker radius based on severity
  const getMarkerRadius = (severity: string) => {
    switch (severity) {
      case "SEVERE":
        return 8;
      case "MINOR":
        return 6;
      case "NO_INJURY":
        return 5;
      default:
        return 5;
    }
  };

  // Format date for display
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Unknown date";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  if (!isMounted) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm font-medium">
          Prediction Map
        </CardTitle>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CORRECTNESS_COLORS.correct.hex }}
            />
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CORRECTNESS_COLORS.incorrect.hex }}
            />
            <span>Incorrect</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <span>Larger = More Severe</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading predictions...
            </span>
          </div>
        ) : (
          <MapContainer
            center={chicagoCenter}
            zoom={11}
            scrollWheelZoom={true}
            className="h-full w-full rounded-b-lg"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />

            {predictions.map((prediction) => (
              <CircleMarker
                key={prediction.crash_record_id}
                center={[prediction.latitude, prediction.longitude]}
                radius={getMarkerRadius(prediction.actual_severity)}
                pathOptions={{
                  color: getMarkerColor(prediction.is_correct),
                  fillColor: getMarkerColor(prediction.is_correct),
                  fillOpacity: 0.7,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="min-w-[200px] space-y-2">
                    <div className="font-medium">
                      {formatDate(prediction.crash_date)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Predicted:
                      </span>
                      <Badge
                        className={`${SEVERITY_COLORS[prediction.predicted_severity].bg} ${SEVERITY_COLORS[prediction.predicted_severity].text} text-xs`}
                      >
                        {prediction.predicted_severity.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Actual:
                      </span>
                      <Badge
                        className={`${SEVERITY_COLORS[prediction.actual_severity].bg} ${SEVERITY_COLORS[prediction.actual_severity].text} text-xs`}
                      >
                        {prediction.actual_severity.replace("_", " ")}
                      </Badge>
                    </div>

                    <div
                      className={`text-xs font-medium ${prediction.is_correct ? "text-green-600" : "text-red-600"}`}
                    >
                      {prediction.is_correct ? "Correct" : "Incorrect"} (
                      {Math.round(prediction.confidence * 100)}% confidence)
                    </div>

                    {prediction.weather_condition && (
                      <div className="text-xs text-muted-foreground">
                        Weather: {prediction.weather_condition}
                      </div>
                    )}

                    {prediction.lighting_condition && (
                      <div className="text-xs text-muted-foreground">
                        Lighting: {prediction.lighting_condition}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </CardContent>
    </Card>
  );
}
