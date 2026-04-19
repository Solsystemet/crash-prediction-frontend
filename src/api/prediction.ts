/**
 * API client for crash severity prediction.
 */

import type {
  PredictionRequest,
  PredictionResponse,
  FeatureOptions,
  HealthResponse,
  AnyPredictionResponse,
  ZonePredictionResponse,
  RegressionPredictionResponse,
  ZonesResponse,
  ZonePredictionByIdRequest,
  AllZonesPredictionResponse,
} from "@/types/prediction"

const API_BASE = "http://localhost:8000"

/**
 * Check API health and model status.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`)
  if (!response.ok) {
    throw new Error("API health check failed")
  }
  return response.json()
}

/**
 * Get available options for categorical features.
 */
export async function getFeatureOptions(): Promise<FeatureOptions> {
  const response = await fetch(`${API_BASE}/api/features`)
  if (!response.ok) {
    throw new Error("Failed to fetch feature options")
  }
  return response.json()
}

/**
 * Make a prediction for crash severity or count.
 * Returns different response types based on model_type in request.
 */
export async function predict(
  request: PredictionRequest
): Promise<AnyPredictionResponse> {
  const response = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Prediction failed")
  }

  return response.json()
}

/**
 * Make a severity prediction (simplified or hierarchical model).
 */
export async function predictSeverity(
  request: PredictionRequest
): Promise<PredictionResponse> {
  return predict({
    ...request,
    model_type: request.model_type ?? "simplified",
  }) as Promise<PredictionResponse>
}

/**
 * Make a zone-based prediction.
 */
export async function predictZones(
  request: PredictionRequest & { latitude: number; longitude: number }
): Promise<ZonePredictionResponse> {
  return predict({
    ...request,
    model_type: "zones",
  }) as Promise<ZonePredictionResponse>
}

/**
 * Make a regression prediction (crash count).
 */
export async function predictRegression(
  request: PredictionRequest
): Promise<RegressionPredictionResponse> {
  return predict({
    ...request,
    model_type: "regression",
  }) as Promise<RegressionPredictionResponse>
}

/**
 * Get all zones with their centroids for map visualization.
 */
export async function getZones(): Promise<ZonesResponse> {
  const response = await fetch(`${API_BASE}/api/zones`)
  if (!response.ok) {
    throw new Error("Failed to fetch zones")
  }
  return response.json()
}

/**
 * Make a zone-based prediction using zone ID (no lat/lng required).
 */
export async function predictByZoneId(
  zoneId: number,
  request: Omit<ZonePredictionByIdRequest, "zone_id">
): Promise<ZonePredictionResponse> {
  const fullRequest: ZonePredictionByIdRequest = {
    ...request,
    zone_id: zoneId,
  }

  const response = await fetch(`${API_BASE}/api/predict/zone/${zoneId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fullRequest),
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "Zone prediction failed")
  }

  return response.json()
}

/**
 * Predict severity for all zones at once.
 */
export async function predictAllZones(
  request: Omit<ZonePredictionByIdRequest, "zone_id">
): Promise<AllZonesPredictionResponse> {
  // Use zone_id: 0 as placeholder (backend ignores it for all-zones endpoint)
  const fullRequest: ZonePredictionByIdRequest = {
    ...request,
    zone_id: 0,
  }

  const response = await fetch(`${API_BASE}/api/predict/zones/all`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fullRequest),
  })

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }))
    throw new Error(error.detail || "All zones prediction failed")
  }

  return response.json()
}
