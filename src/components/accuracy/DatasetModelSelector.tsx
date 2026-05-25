/**
 * Dataset-aware model selector component.
 * Fetches available models from the API and displays them grouped by dataset combination.
 */

import { useEffect, useState, useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getAvailableModels } from "@/api/accuracy"
import type { AvailableModelInfo, ModelValue } from "@/types/accuracy"

type DatasetModelSelectorProps = {
  /** Currently selected model key */
  selectedModel: ModelValue
  /** Called when model selection changes */
  onModelChange: (model: ModelValue) => void
  /** Whether to include unavailable (not trained) models */
  showUnavailable?: boolean
  /** Whether the selector is disabled */
  disabled?: boolean
  /** Optional class name for the trigger */
  className?: string
}

/** Dataset badge colors */
const DATASET_COLORS = {
  vehicle: "bg-blue-100 text-blue-700 border-blue-200",
  people: "bg-purple-100 text-purple-700 border-purple-200",
  weather: "bg-amber-100 text-amber-700 border-amber-200",
} as const

/** Model type labels for grouping */
const MODEL_TYPE_LABELS: Record<string, string> = {
  simplified: "Simplified 3-Class",
  hierarchical: "Hierarchical 5-Class",
  zones: "Zone-Based",
  simple: "Baseline",
  tuned: "Tuned Models",
  deep: "Deep Learning",
  regression: "Regression",
  unknown: "Other",
}

/**
 * Renders dataset badges for a model.
 */
function DatasetBadges({ model }: { model: AvailableModelInfo }) {
  const { datasets } = model

  // If no extra datasets, show "Crash Only"
  if (!datasets.use_vehicles && !datasets.use_people && !datasets.use_weather) {
    return (
      <Badge variant="outline" className="ml-auto text-[10px] font-normal">
        Crash Only
      </Badge>
    )
  }

  return (
    <div className="ml-auto flex gap-1">
      {datasets.use_vehicles && (
        <Badge
          variant="outline"
          className={`text-[10px] font-normal ${DATASET_COLORS.vehicle}`}
        >
          V
        </Badge>
      )}
      {datasets.use_people && (
        <Badge
          variant="outline"
          className={`text-[10px] font-normal ${DATASET_COLORS.people}`}
        >
          P
        </Badge>
      )}
      {datasets.use_weather && (
        <Badge
          variant="outline"
          className={`text-[10px] font-normal ${DATASET_COLORS.weather}`}
        >
          W
        </Badge>
      )}
    </div>
  )
}

/**
 * Dataset legend showing what the badges mean.
 */
export function DatasetLegend() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="font-medium">Datasets:</span>
      <span className="flex items-center gap-1">
        <Badge
          variant="outline"
          className={`text-[10px] ${DATASET_COLORS.vehicle}`}
        >
          V
        </Badge>
        Vehicle
      </span>
      <span className="flex items-center gap-1">
        <Badge
          variant="outline"
          className={`text-[10px] ${DATASET_COLORS.people}`}
        >
          P
        </Badge>
        People
      </span>
      <span className="flex items-center gap-1">
        <Badge
          variant="outline"
          className={`text-[10px] ${DATASET_COLORS.weather}`}
        >
          W
        </Badge>
        Weather
      </span>
    </div>
  )
}

export function DatasetModelSelector({
  selectedModel,
  onModelChange,
  showUnavailable = false,
  disabled = false,
  className = "w-[280px]",
}: DatasetModelSelectorProps) {
  const [models, setModels] = useState<AvailableModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch models on mount
  useEffect(() => {
    let mounted = true

    async function fetchModels() {
      try {
        const response = await getAvailableModels(showUnavailable)
        if (mounted) {
          setModels(response.models)
          setError(null)
        }
      } catch (err) {
        console.error("Failed to load models:", err)
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load models")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchModels()

    return () => {
      mounted = false
    }
  }, [showUnavailable])

  // Group models by type
  const groupedModels = useMemo(() => {
    const groups: Record<string, AvailableModelInfo[]> = {}

    for (const model of models) {
      // Skip regression models (not for accuracy)
      if (model.model_type === "regression") continue

      // Skip unavailable if not showing them
      if (!showUnavailable && !model.is_available) continue

      const type = model.model_type || "unknown"
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(model)
    }

    return groups
  }, [models, showUnavailable])

  // Get display name for selected model
  const selectedModelInfo = useMemo(() => {
    return models.find((m) => m.key === selectedModel)
  }, [models, selectedModel])

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className={className}>
          <SelectValue placeholder="Loading models..." />
        </SelectTrigger>
      </Select>
    )
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger className={`${className} border-destructive`}>
          <SelectValue placeholder="Error loading models" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select
      value={selectedModel}
      onValueChange={(v) => onModelChange(v as ModelValue)}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="truncate">
            {selectedModelInfo?.name || selectedModel}
          </span>
          {selectedModelInfo && <DatasetBadges model={selectedModelInfo} />}
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[400px]">
        {Object.entries(groupedModels).map(([type, typeModels]) => (
          <SelectGroup key={type}>
            <SelectLabel className="text-xs font-semibold text-muted-foreground">
              {MODEL_TYPE_LABELS[type] || type}
            </SelectLabel>
            {typeModels.map((model) => (
              <SelectItem
                key={model.key}
                value={model.key}
                disabled={!model.is_available}
                className="flex items-center justify-between"
              >
                <div className="flex w-full items-center gap-2">
                  <span
                    className={
                      !model.is_available ? "text-muted-foreground" : ""
                    }
                  >
                    {model.name}
                  </span>
                  <DatasetBadges model={model} />
                  {!model.is_available && (
                    <Badge
                      variant="outline"
                      className="ml-1 text-[10px] text-muted-foreground"
                    >
                      Not trained
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}

        {Object.keys(groupedModels).length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No models available
          </div>
        )}
      </SelectContent>
    </Select>
  )
}
