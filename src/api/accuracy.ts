/**
 * API client for accuracy evaluation endpoints.
 */

import type {
  AccuracyResponse,
  MapDataResponse,
  TimeRangeValue,
  ModelValue,
  ModelComparisonResponse,
  RocDataResponse,
  RocComparisonResponse,
  DateRangeFilter,
  AvailableModelsResponse,
} from "@/types/accuracy"

const API_BASE = "http://localhost:8000"

export type MapFilter = "all" | "correct" | "incorrect"

/**
 * Format a Date object to ISO date string (YYYY-MM-DD) for API calls.
 */
function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0]
}

/**
 * Options for date-based API calls.
 * Either use `days` for relative time range, or `dateRange` for specific dates.
 */
export type DateFilterOptions =
  | { days: TimeRangeValue; dateRange?: never }
  | { days?: never; dateRange: DateRangeFilter }

/**
 * Fetch accuracy metrics and predictions for crash data.
 *
 * @param dateFilter - Either days (1, 7, 30, 90) or a specific date range
 * @param maxCrashes - Maximum number of crashes to process
 * @param model - Model to evaluate (optional, defaults to simplified_3class)
 * @returns AccuracyResponse with metrics and individual predictions
 */
export async function getAccuracyMetrics(
  dateFilter: DateFilterOptions,
  maxCrashes: number,
  model?: ModelValue
): Promise<AccuracyResponse> {
  const params = new URLSearchParams({
    max_crashes: maxCrashes.toString(),
  })

  // Add date parameters based on filter type
  if ("dateRange" in dateFilter && dateFilter.dateRange) {
    params.set("start_date", formatDateForAPI(dateFilter.dateRange.from))
    params.set("end_date", formatDateForAPI(dateFilter.dateRange.to))
  } else if ("days" in dateFilter && dateFilter.days) {
    params.set("days", dateFilter.days.toString())
  }

  if (model) {
    params.set("model", model)
  }

  const response = await fetch(`${API_BASE}/api/accuracy?${params}`)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Failed to fetch accuracy metrics")
  }

  return response.json()
}

/**
 * Fetch accuracy comparison for all models.
 *
 * @param dateFilter - Either days (1, 7, 30, 90) or a specific date range
 * @param maxCrashes - Maximum number of crashes per model
 * @returns ModelComparisonResponse with metrics for each model
 */
export async function getModelComparison(
  dateFilter: DateFilterOptions,
  maxCrashes: number = 2000
): Promise<ModelComparisonResponse> {
  const params = new URLSearchParams({
    max_crashes: maxCrashes.toString(),
  })

  // Add date parameters based on filter type
  if ("dateRange" in dateFilter && dateFilter.dateRange) {
    params.set("start_date", formatDateForAPI(dateFilter.dateRange.from))
    params.set("end_date", formatDateForAPI(dateFilter.dateRange.to))
  } else if ("days" in dateFilter && dateFilter.days) {
    params.set("days", dateFilter.days.toString())
  }

  const response = await fetch(`${API_BASE}/api/accuracy/compare?${params}`)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Failed to fetch model comparison")
  }

  return response.json()
}

/**
 * Fetch prediction data formatted for map visualization.
 *
 * @param dateFilter - Either days (1, 7, 30, 90) or a specific date range
 * @param maxCrashes - Maximum number of crashes (keep lower for map performance)
 * @param filter - Filter by correctness: 'all', 'correct', or 'incorrect'
 * @param model - Model to use (optional, defaults to simplified_3class)
 * @returns MapDataResponse with coordinates and summary counts
 */
export async function getMapData(
  dateFilter: DateFilterOptions,
  maxCrashes: number = 200,
  filter: MapFilter = "all",
  model?: ModelValue
): Promise<MapDataResponse> {
  const params = new URLSearchParams({
    max_crashes: maxCrashes.toString(),
  })

  // Add date parameters based on filter type
  if ("dateRange" in dateFilter && dateFilter.dateRange) {
    params.set("start_date", formatDateForAPI(dateFilter.dateRange.from))
    params.set("end_date", formatDateForAPI(dateFilter.dateRange.to))
  } else if ("days" in dateFilter && dateFilter.days) {
    params.set("days", dateFilter.days.toString())
  }

  // Only add filter param if not "all"
  if (filter !== "all") {
    params.set("filter", filter)
  }

  if (model) {
    params.set("model", model)
  }

  const response = await fetch(`${API_BASE}/api/accuracy/map?${params}`)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Failed to fetch map data")
  }

  return response.json()
}

/**
 * Fetch ROC curve data for a model.
 *
 * @param dateFilter - Either days (1, 7, 30, 90) or a specific date range
 * @param maxCrashes - Maximum number of crashes to evaluate
 * @param model - Model to evaluate (optional, defaults to simplified_3class)
 * @returns RocDataResponse with curve points and AUC scores
 */
export async function getROCData(
  dateFilter: DateFilterOptions,
  maxCrashes: number = 2000,
  model?: ModelValue
): Promise<RocDataResponse> {
  const params = new URLSearchParams({
    max_crashes: maxCrashes.toString(),
  })

  // Add date parameters based on filter type
  if ("dateRange" in dateFilter && dateFilter.dateRange) {
    params.set("start_date", formatDateForAPI(dateFilter.dateRange.from))
    params.set("end_date", formatDateForAPI(dateFilter.dateRange.to))
  } else if ("days" in dateFilter && dateFilter.days) {
    params.set("days", dateFilter.days.toString())
  }

  if (model) {
    params.set("model", model)
  }

  const response = await fetch(`${API_BASE}/api/accuracy/roc?${params}`)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Failed to fetch ROC data")
  }

  return response.json()
}

/**
 * Fetch ROC curve data for all models.
 *
 * @param dateFilter - Either days (1, 7, 30, 90) or a specific date range
 * @param maxCrashes - Maximum number of crashes per model
 * @returns RocComparisonResponse with ROC data for each model
 */
export async function getROCComparison(
  dateFilter: DateFilterOptions,
  maxCrashes: number = 2000
): Promise<RocComparisonResponse> {
  const params = new URLSearchParams({
    max_crashes: maxCrashes.toString(),
  })

  // Add date parameters based on filter type
  if ("dateRange" in dateFilter && dateFilter.dateRange) {
    params.set("start_date", formatDateForAPI(dateFilter.dateRange.from))
    params.set("end_date", formatDateForAPI(dateFilter.dateRange.to))
  } else if ("days" in dateFilter && dateFilter.days) {
    params.set("days", dateFilter.days.toString())
  }

  const response = await fetch(`${API_BASE}/api/accuracy/roc/compare?${params}`)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Failed to fetch ROC comparison")
  }

  return response.json()
}

// ============================================================================
// Available Models API
// ============================================================================

/**
 * Fetch list of available models with their dataset configurations.
 *
 * @param includeUnavailable - If true, includes models that aren't trained yet
 * @returns AvailableModelsResponse with all model information
 */
export async function getAvailableModels(
  includeUnavailable: boolean = false
): Promise<AvailableModelsResponse> {
  const params = new URLSearchParams()
  if (includeUnavailable) {
    params.set("include_unavailable", "true")
  }

  const url = params.toString()
    ? `${API_BASE}/api/models?${params}`
    : `${API_BASE}/api/models`

  const response = await fetch(url)

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Failed to fetch available models")
  }

  return response.json()
}

/**
 * Refresh the model registry on the server.
 * Call this after training new models.
 */
export async function refreshModels(): Promise<{
  status: string
  message: string
  models: string[]
}> {
  const response = await fetch(`${API_BASE}/api/models/refresh`, {
    method: "POST",
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Failed to refresh models")
  }

  return response.json()
}
