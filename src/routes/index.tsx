import { createFileRoute } from "@tanstack/react-router"
import { lazy, Suspense, useEffect, useState, useCallback } from "react"
import {
  PredictionSidebar,
  type ZoneState,
} from "@/components/PredictionSidebar"
import type { ZonePredictionResponse } from "@/types/prediction"

const MapComponent = lazy(() => import("../components/Map"))

export const Route = createFileRoute("/")({ component: App })

function App() {
  const [isMounted, setIsMounted] = useState(false)

  // Zone state shared between sidebar and map
  const [zoneState, setZoneState] = useState<ZoneState>({
    selectedZoneId: undefined,
    zonePredictions: new Map(),
    showZones: false,
  })
  const [clickedZoneId, setClickedZoneId] = useState<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleZoneStateChange = useCallback((state: ZoneState) => {
    setZoneState(state)
  }, [])

  const handleZoneClick = useCallback((zoneId: number) => {
    setClickedZoneId(zoneId)
    // Reset after a tick so it can be clicked again
    setTimeout(() => setClickedZoneId(null), 100)
  }, [])

  return (
    <div className="h-screen w-full">
      <PredictionSidebar
        onZoneStateChange={handleZoneStateChange}
        externalZoneId={clickedZoneId}
      >
        <div className="h-[calc(100vh-48px)] w-full">
          {isMounted ? (
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  Loading map...
                </div>
              }
            >
              <MapComponent
                showZones={zoneState.showZones}
                selectedZoneId={zoneState.selectedZoneId}
                zonePredictions={zoneState.zonePredictions}
                onZoneClick={handleZoneClick}
              />
            </Suspense>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              Loading map...
            </div>
          )}
        </div>
      </PredictionSidebar>
    </div>
  )
}
