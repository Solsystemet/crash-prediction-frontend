/**
 * API client for crash severity prediction.
 */

import type {
  PredictionRequest,
  PredictionResponse,
  FeatureOptions,
  HealthResponse,
} from "@/types/prediction";

const API_BASE = "http://localhost:8000";

/**
 * Check API health and model status.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error("API health check failed");
  }
  return response.json();
}

/**
 * Get available options for categorical features.
 */
export async function getFeatureOptions(): Promise<FeatureOptions> {
  const response = await fetch(`${API_BASE}/api/features`);
  if (!response.ok) {
    throw new Error("Failed to fetch feature options");
  }
  return response.json();
}

/**
 * Make a prediction for crash severity.
 */
export async function predict(
  request: PredictionRequest
): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE}/api/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Prediction failed");
  }

  return response.json();
}
