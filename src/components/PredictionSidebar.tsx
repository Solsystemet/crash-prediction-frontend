/**
 * Collapsible sidebar for crash severity prediction with model tabs.
 */

import { useState, useEffect } from "react"
import { Link } from "@tanstack/react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PredictionForm } from "@/components/PredictionForm"
import { PredictionResult } from "@/components/PredictionResult"
import {
  predict,
  getFeatureOptions,
  predictByZoneId,
  predictAllZones,
} from "@/api/prediction"
import type {
  PredictionRequest,
  FeatureOptions,
  AnyPredictionResponse,
  ModelType,
  ZonePredictionResponse,
} from "@/types/prediction"
import { MODEL_TYPE_INFO, DEFAULT_PREDICTION_REQUEST } from "@/types/prediction"

type PredictionSidebarProps = {
  children: React.ReactNode
  /** Called when zone-related state changes (for map updates) */
  onZoneStateChange?: (state: ZoneState) => void
  /** External zone click from map */
  externalZoneId?: number | null
}

export type ZoneState = {
  selectedZoneId: number | null | undefined
  zonePredictions: Map<number, ZonePredictionResponse>
  showZones: boolean
}

export function PredictionSidebar({
  children,
  onZoneStateChange,
  externalZoneId,
}: PredictionSidebarProps) {
  const [featureOptions, setFeatureOptions] = useState<FeatureOptions | null>(
    null
  )
  const [result, setResult] = useState<AnyPredictionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeModel, setActiveModel] = useState<ModelType>("simplified")

  // Zone-specific state
  const [selectedZoneId, setSelectedZoneId] = useState<
    number | null | undefined
  >(undefined)
  const [zonePredictions, setZonePredictions] = useState<
    Map<number, ZonePredictionResponse>
  >(new Map())
  const [lastFormData, setLastFormData] = useState<PredictionRequest | null>(
    null
  )

  // Load feature options on mount
  useEffect(() => {
    getFeatureOptions()
      .then(setFeatureOptions)
      .catch((err) => {
        console.warn("Failed to load feature options:", err)
      })
  }, [])

  // Notify parent of zone state changes
  useEffect(() => {
    onZoneStateChange?.({
      selectedZoneId,
      zonePredictions,
      showZones: activeModel === "zones",
    })
  }, [selectedZoneId, zonePredictions, activeModel, onZoneStateChange])

  // Handle external zone click from map
  useEffect(() => {
    if (externalZoneId !== undefined && externalZoneId !== null) {
      setSelectedZoneId(externalZoneId)
    }
  }, [externalZoneId])

  // Clear results when switching models
  const handleModelChange = (model: string) => {
    setActiveModel(model as ModelType)
    setResult(null)
    setError(null)
    // Reset zone state when switching away from zones
    if (model !== "zones") {
      setSelectedZoneId(undefined)
      setZonePredictions(new Map())
    }
  }

  const handleZoneChange = (zoneId: number | null) => {
    setSelectedZoneId(zoneId)
    setResult(null)
    setError(null)
  }

  const handleSubmit = async (data: PredictionRequest) => {
    setIsLoading(true)
    setError(null)
    setLastFormData(data)

    try {
      // Handle zone-based predictions differently
      if (activeModel === "zones") {
        if (selectedZoneId === null) {
          // Predict all zones
          const allZonesResponse = await predictAllZones(data)

          // Build map of zone predictions
          const newPredictions = new Map<number, ZonePredictionResponse>()
          for (const prediction of allZonesResponse.predictions) {
            newPredictions.set(prediction.zone_id, prediction)
          }
          setZonePredictions(newPredictions)

          // Set first prediction as result for display
          if (allZonesResponse.predictions.length > 0) {
            setResult(allZonesResponse.predictions[0])
          }
        } else if (selectedZoneId !== undefined) {
          // Predict for specific zone
          const zoneResponse = await predictByZoneId(selectedZoneId, data)
          setResult(zoneResponse)

          // Update zone predictions map
          setZonePredictions((prev) => {
            const next = new Map(prev)
            next.set(selectedZoneId, zoneResponse)
            return next
          })
        } else {
          setError("Please select a zone or choose 'All Zones'")
          return
        }
      } else {
        // Regular prediction flow
        const requestWithModel = {
          ...data,
          model_type: activeModel,
        }
        const response = await predict(requestWithModel)
        setResult(response)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed")
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setZonePredictions(new Map())
    setSelectedZoneId(undefined)
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Crash Prediction</h2>
          </div>

          {/* Model selection tabs */}
          <Tabs
            value={activeModel}
            onValueChange={handleModelChange}
            className="mt-2"
          >
            <TabsList layout="grid" className="grid-cols-2 gap-1">
              <TabsTrigger value="simplified" className="px-2 py-1.5 text-xs">
                Severity
              </TabsTrigger>
              <TabsTrigger value="hierarchical" className="px-2 py-1.5 text-xs">
                5-Class
              </TabsTrigger>
              <TabsTrigger value="zones" className="px-2 py-1.5 text-xs">
                Zones
              </TabsTrigger>
              <TabsTrigger value="regression" className="px-2 py-1.5 text-xs">
                Count
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <p className="mt-2 text-xs text-muted-foreground">
            {MODEL_TYPE_INFO[activeModel].description}
          </p>
        </SidebarHeader>

        {/* Single scrollable area for both form and results */}
        <SidebarContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              {/* Prediction Form */}
              <PredictionForm
                featureOptions={featureOptions}
                onSubmit={handleSubmit}
                onReset={handleReset}
                isLoading={isLoading}
                modelType={activeModel}
                selectedZoneId={selectedZoneId}
                onZoneChange={handleZoneChange}
              />

              {/* Zone predictions summary for all-zones mode */}
              {activeModel === "zones" &&
                selectedZoneId === null &&
                zonePredictions.size > 0 && (
                  <div className="rounded-md border bg-muted/30 p-3">
                    <h4 className="mb-2 text-xs font-semibold">
                      All Zones Summary ({zonePredictions.size} zones)
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded bg-green-500/20 p-2 text-center">
                        <div className="font-medium text-green-700">
                          {
                            Array.from(zonePredictions.values()).filter(
                              (p) => p.prediction === "NO_INJURY"
                            ).length
                          }
                        </div>
                        <div className="text-muted-foreground">No Injury</div>
                      </div>
                      <div className="rounded bg-yellow-500/20 p-2 text-center">
                        <div className="font-medium text-yellow-700">
                          {
                            Array.from(zonePredictions.values()).filter(
                              (p) => p.prediction === "MINOR"
                            ).length
                          }
                        </div>
                        <div className="text-muted-foreground">Minor</div>
                      </div>
                      <div className="rounded bg-red-500/20 p-2 text-center">
                        <div className="font-medium text-red-700">
                          {
                            Array.from(zonePredictions.values()).filter(
                              (p) => p.prediction === "SEVERE"
                            ).length
                          }
                        </div>
                        <div className="text-muted-foreground">Severe</div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Results section - scrollable with form */}
              <div className="border-t pt-4">
                <PredictionResult
                  result={result}
                  isLoading={isLoading}
                  error={error}
                  modelType={activeModel}
                />
              </div>
            </div>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-12 items-center justify-between gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="text-sm font-medium">Crash Prediction Map</span>
          </div>
          <Link to="/accuracy">
            <Button variant="outline" size="sm">
              Model Accuracy
            </Button>
          </Link>
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
