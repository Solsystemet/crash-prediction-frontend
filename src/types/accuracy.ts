/**
 * Types and Zod schemas for the accuracy evaluation API.
 */

import { z } from "zod";
import { SeverityClassSchema } from "./prediction";

// Class metrics for a single severity class
export const ClassMetricsSchema = z.object({
  precision: z.number().min(0).max(1),
  recall: z.number().min(0).max(1),
  f1_score: z.number().min(0).max(1),
  support: z.number().int().min(0),
});

export type ClassMetrics = z.infer<typeof ClassMetricsSchema>;

// Overall accuracy metrics
export const AccuracyMetricsSchema = z.object({
  overall_accuracy: z.number().min(0).max(1),
  sample_count: z.number().int().min(0),
  per_class_metrics: z.record(z.string(), ClassMetricsSchema),
  confusion_matrix: z.array(z.array(z.number().int())),
  class_labels: z.array(z.string()),
  time_range_days: z.number().int(),
  computed_at: z.string(),
});

export type AccuracyMetrics = z.infer<typeof AccuracyMetricsSchema>;

// A single prediction with actual outcome
export const PredictionWithActualSchema = z.object({
  crash_record_id: z.string(),
  crash_date: z.string().nullable(),
  predicted_severity: SeverityClassSchema,
  actual_severity: SeverityClassSchema,
  is_correct: z.boolean(),
  confidence: z.number().min(0).max(1),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  weather_condition: z.string().nullable(),
  lighting_condition: z.string().nullable(),
  first_crash_type: z.string().nullable().optional(),
  posted_speed_limit: z.number().int().nullable().optional(),
});

export type PredictionWithActual = z.infer<typeof PredictionWithActualSchema>;

// Full accuracy response
export const AccuracyResponseSchema = z.object({
  metrics: AccuracyMetricsSchema,
  predictions: z.array(PredictionWithActualSchema),
});

export type AccuracyResponse = z.infer<typeof AccuracyResponseSchema>;

// Map prediction data
export const MapPredictionSchema = z.object({
  crash_record_id: z.string(),
  crash_date: z.string().nullable(),
  predicted_severity: SeverityClassSchema,
  actual_severity: SeverityClassSchema,
  is_correct: z.boolean(),
  confidence: z.number().min(0).max(1),
  latitude: z.number(),
  longitude: z.number(),
  weather_condition: z.string().nullable(),
  lighting_condition: z.string().nullable(),
});

export type MapPrediction = z.infer<typeof MapPredictionSchema>;

// Map data response
export const MapDataResponseSchema = z.object({
  predictions: z.array(MapPredictionSchema),
  total_count: z.number().int(),
  correct_count: z.number().int(),
  incorrect_count: z.number().int(),
});

export type MapDataResponse = z.infer<typeof MapDataResponseSchema>;

// Time range options for the UI
export const TIME_RANGE_OPTIONS = [
  { value: 1, label: "Last 24 hours" },
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
] as const;

export type TimeRangeValue = (typeof TIME_RANGE_OPTIONS)[number]["value"];

// Severity class colors for visualization
export const SEVERITY_COLORS = {
  NO_INJURY: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
    hex: "#22c55e",
  },
  MINOR: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
    hex: "#eab308",
  },
  SEVERE: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
    hex: "#ef4444",
  },
} as const;

// Prediction correctness colors
export const CORRECTNESS_COLORS = {
  correct: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-400",
    hex: "#22c55e",
    markerClass: "correct-marker",
  },
  incorrect: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-400",
    hex: "#ef4444",
    markerClass: "incorrect-marker",
  },
} as const;
