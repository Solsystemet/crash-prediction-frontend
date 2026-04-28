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
  f1_macro: z.number().min(0).max(1),
  f1_micro: z.number().min(0).max(1),
  model_name: z.string().nullable().optional(),
});

export type AccuracyMetrics = z.infer<typeof AccuracyMetricsSchema>;

// Available model options
export const MODEL_OPTIONS = [
  { value: "simplified_3class", label: "Simplified 3-Class", type: "simplified" },
  { value: "hierarchical_5class", label: "Hierarchical 5-Class", type: "hierarchical" },
  { value: "simplified_zones", label: "Zone-Based", type: "zones" },
] as const;

export type ModelValue = (typeof MODEL_OPTIONS)[number]["value"];

// Model comparison response
export const ModelComparisonResultSchema = z.object({
  model_name: z.string(),
  display_name: z.string(),
  model_type: z.string(),
  metrics: AccuracyMetricsSchema.nullable(),
  status: z.enum(["success", "error"]),
  error: z.string().nullable().optional(),
});

export type ModelComparisonResult = z.infer<typeof ModelComparisonResultSchema>;

export const ModelComparisonResponseSchema = z.object({
  models: z.record(z.string(), ModelComparisonResultSchema),
  time_range_days: z.number().int(),
  max_crashes: z.number().int(),
  computed_at: z.string(),
});

export type ModelComparisonResponse = z.infer<typeof ModelComparisonResponseSchema>;

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

// Time range options for the UI (kept for backward compatibility)
export const TIME_RANGE_OPTIONS = [
  { value: 1, label: "Last 24 hours" },
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
] as const;

export type TimeRangeValue = (typeof TIME_RANGE_OPTIONS)[number]["value"];

// Date range type for custom date selection
export type DateRangeFilter = {
  from: Date;
  to: Date;
};

// Sample size options for the UI
export const SAMPLE_SIZE_OPTIONS = [
  { value: 500, label: "500 samples" },
  { value: 1000, label: "1,000 samples" },
  { value: 2000, label: "2,000 samples" },
  { value: 5000, label: "5,000 samples" },
  { value: 10000, label: "10,000 samples" },
] as const;

export type SampleSizeValue = (typeof SAMPLE_SIZE_OPTIONS)[number]["value"];

// Severity class colors for visualization (3-class)
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
  // 5-class hierarchical labels
  REPORTED_NOT_EVIDENT: {
    bg: "bg-lime-100",
    text: "text-lime-800",
    border: "border-lime-300",
    hex: "#84cc16",
  },
  NONINCAPACITATING: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
    hex: "#eab308",
  },
  INCAPACITATING: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-300",
    hex: "#f97316",
  },
  FATAL: {
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

// ROC Curve types
export const RocCurveSchema = z.object({
  name: z.string(),
  auc: z.number().min(0).max(1),
  color: z.string(),
  fpr: z.array(z.number()),
  tpr: z.array(z.number()),
  n_samples: z.number().int().min(0),
  n_positive: z.number().int().min(0),
});

export type RocCurve = z.infer<typeof RocCurveSchema>;

export const RocDataResponseSchema = z.object({
  model_name: z.string(),
  model_type: z.string().optional(),
  curves: z.array(RocCurveSchema),
  computed_at: z.string(),
});

export type RocDataResponse = z.infer<typeof RocDataResponseSchema>;

// ROC comparison (multiple models)
export const RocModelResultSchema = z.object({
  model_name: z.string(),
  display_name: z.string(),
  model_type: z.string(),
  curves: z.array(RocCurveSchema),
  status: z.enum(["success", "error"]),
  error: z.string().nullable().optional(),
});

export type RocModelResult = z.infer<typeof RocModelResultSchema>;

export const RocComparisonResponseSchema = z.object({
  models: z.record(z.string(), RocModelResultSchema),
  time_range_days: z.number().int(),
  max_crashes: z.number().int(),
  computed_at: z.string(),
});

export type RocComparisonResponse = z.infer<typeof RocComparisonResponseSchema>;
