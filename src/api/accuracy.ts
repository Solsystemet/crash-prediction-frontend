/**
 * API client for accuracy evaluation endpoints.
 */

import type {
  AccuracyResponse,
  MapDataResponse,
  TimeRangeValue,
} from "@/types/accuracy";

const API_BASE = "http://localhost:8000";

export type MapFilter = "all" | "correct" | "incorrect";

/**
 * Fetch accuracy metrics and predictions for recent crash data.
 *
 * @param days - Number of days of data to evaluate (1, 7, 30, or 90)
 * @param maxCrashes - Maximum number of crashes to process
 * @returns AccuracyResponse with metrics and individual predictions
 */
export async function getAccuracyMetrics(
  days: TimeRangeValue = 7,
  maxCrashes: number = 500
): Promise<AccuracyResponse> {
  const params = new URLSearchParams({
    days: days.toString(),
    max_crashes: maxCrashes.toString(),
  });

  const response = await fetch(`${API_BASE}/api/accuracy?${params}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to fetch accuracy metrics");
  }

  return response.json();
}

/**
 * Fetch prediction data formatted for map visualization.
 *
 * @param days - Number of days of data to fetch
 * @param maxCrashes - Maximum number of crashes (keep lower for map performance)
 * @param filter - Filter by correctness: 'all', 'correct', or 'incorrect'
 * @returns MapDataResponse with coordinates and summary counts
 */
export async function getMapData(
  days: TimeRangeValue = 7,
  maxCrashes: number = 200,
  filter: MapFilter = "all"
): Promise<MapDataResponse> {
  const params = new URLSearchParams({
    days: days.toString(),
    max_crashes: maxCrashes.toString(),
  });

  // Only add filter param if not "all"
  if (filter !== "all") {
    params.set("filter", filter);
  }

  const response = await fetch(`${API_BASE}/api/accuracy/map?${params}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to fetch map data");
  }

  return response.json();
}
