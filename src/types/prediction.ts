/**
 * Types and Zod schemas for the crash severity prediction API.
 */

import { z } from "zod";

// Severity class enum
export const SeverityClassSchema = z.enum(["NO_INJURY", "MINOR", "SEVERE"]);
export type SeverityClass = z.infer<typeof SeverityClassSchema>;

// Prediction request schema with validation
export const PredictionRequestSchema = z.object({
  // Crash information
  person_count: z
    .number()
    .int()
    .min(1, "At least 1 person required")
    .max(50, "Maximum 50 people"),
  vehicle_count: z
    .number()
    .int()
    .min(1, "At least 1 vehicle required")
    .max(20, "Maximum 20 vehicles"),
  first_crash_type: z.string().min(1, "Crash type is required"),
  damage: z.string().min(1, "Damage level is required"),
  prim_contributory_cause: z.string().min(1, "Primary cause is required"),

  // People features
  age_mean: z
    .number()
    .min(0, "Age must be positive")
    .max(120, "Maximum age is 120"),
  age_min: z
    .number()
    .int()
    .min(0, "Age must be positive")
    .max(120, "Maximum age is 120"),
  age_max: z
    .number()
    .int()
    .min(0, "Age must be positive")
    .max(120, "Maximum age is 120"),
  driver_count: z
    .number()
    .int()
    .min(0, "Cannot be negative")
    .max(20, "Maximum 20 drivers"),

  // Vehicle features
  avg_vehicle_year: z
    .number()
    .int()
    .min(1900, "Year must be after 1900")
    .max(2030, "Year must be before 2030"),
  oldest_vehicle_year: z
    .number()
    .int()
    .min(1900, "Year must be after 1900")
    .max(2030, "Year must be before 2030"),

  // Road/Location features
  posted_speed_limit: z
    .number()
    .int()
    .min(0, "Speed limit must be positive")
    .max(100, "Maximum speed limit is 100"),
  traffic_control_device: z.string().min(1, "Traffic control is required"),
  device_condition: z.string().min(1, "Device condition is required"),
  trafficway_type: z.string().min(1, "Trafficway type is required"),
  lighting_condition: z.string().min(1, "Lighting condition is required"),
  road_defect: z.string().min(1, "Road defect is required"),
  roadway_surface_cond: z.string().min(1, "Road surface is required"),
  alignment: z.string().min(1, "Alignment is required"),

  // Weather features
  weather_condition: z.string().min(1, "Weather condition is required"),
  air_temperature: z
    .number()
    .min(-50, "Minimum temperature is -50°F")
    .max(150, "Maximum temperature is 150°F"),
  humidity: z
    .number()
    .min(0, "Humidity must be positive")
    .max(100, "Maximum humidity is 100%"),
  wind_speed: z
    .number()
    .min(0, "Wind speed must be positive")
    .max(200, "Maximum wind speed is 200 mph"),
  rain_intensity: z
    .number()
    .min(0, "Rain intensity must be positive")
    .max(10, "Maximum rain intensity is 10"),

  // Time features
  crash_hour: z
    .number()
    .int()
    .min(0, "Hour must be 0-23")
    .max(23, "Hour must be 0-23"),
  crash_day_of_week: z
    .number()
    .int()
    .min(1, "Day must be 1-7")
    .max(7, "Day must be 1-7"),
  crash_month: z
    .number()
    .int()
    .min(1, "Month must be 1-12")
    .max(12, "Month must be 1-12"),
});

export type PredictionRequest = z.infer<typeof PredictionRequestSchema>;

// Prediction probabilities
export const PredictionProbabilitiesSchema = z.object({
  no_injury: z.number().min(0).max(1),
  minor: z.number().min(0).max(1),
  severe: z.number().min(0).max(1),
});

export type PredictionProbabilities = z.infer<typeof PredictionProbabilitiesSchema>;

// Prediction response
export const PredictionResponseSchema = z.object({
  prediction: SeverityClassSchema,
  probabilities: PredictionProbabilitiesSchema,
  confidence: z.number().min(0).max(1),
  model_name: z.string(),
});

export type PredictionResponse = z.infer<typeof PredictionResponseSchema>;

// Feature options for dropdowns
export const FeatureOptionsSchema = z.object({
  first_crash_type: z.array(z.string()),
  damage: z.array(z.string()),
  prim_contributory_cause: z.array(z.string()),
  weather_condition: z.array(z.string()),
  lighting_condition: z.array(z.string()),
  roadway_surface_cond: z.array(z.string()),
  traffic_control_device: z.array(z.string()),
  device_condition: z.array(z.string()),
  trafficway_type: z.array(z.string()),
  road_defect: z.array(z.string()),
  alignment: z.array(z.string()),
});

export type FeatureOptions = z.infer<typeof FeatureOptionsSchema>;

// Health response
export const HealthResponseSchema = z.object({
  status: z.string(),
  model_loaded: z.boolean(),
  model_name: z.string().nullable(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// Default values for the prediction form
export const DEFAULT_PREDICTION_REQUEST: PredictionRequest = {
  person_count: 2,
  vehicle_count: 2,
  first_crash_type: "REAR END",
  damage: "OVER $1,500",
  prim_contributory_cause: "FOLLOWING TOO CLOSELY",
  age_mean: 35,
  age_min: 25,
  age_max: 45,
  driver_count: 2,
  avg_vehicle_year: 2018,
  oldest_vehicle_year: 2015,
  posted_speed_limit: 30,
  traffic_control_device: "TRAFFIC SIGNAL",
  device_condition: "FUNCTIONING PROPERLY",
  trafficway_type: "NOT DIVIDED",
  lighting_condition: "DAYLIGHT",
  road_defect: "NO DEFECTS",
  roadway_surface_cond: "DRY",
  alignment: "STRAIGHT AND LEVEL",
  weather_condition: "CLEAR",
  air_temperature: 70,
  humidity: 50,
  wind_speed: 10,
  rain_intensity: 0,
  crash_hour: 14,
  crash_day_of_week: 3,
  crash_month: 6,
};

// Default feature options (fallback when API is unavailable)
export const DEFAULT_FEATURE_OPTIONS: FeatureOptions = {
  first_crash_type: [
    "REAR END",
    "TURNING",
    "ANGLE",
    "SIDESWIPE SAME DIRECTION",
    "PARKED MOTOR VEHICLE",
    "HEAD ON",
    "FIXED OBJECT",
    "PEDESTRIAN",
    "PEDALCYCLIST",
  ],
  damage: ["$500 OR LESS", "$501 - $1,500", "OVER $1,500"],
  prim_contributory_cause: [
    "FAILING TO YIELD RIGHT-OF-WAY",
    "FOLLOWING TOO CLOSELY",
    "IMPROPER BACKING",
    "IMPROPER LANE USAGE",
    "IMPROPER TURNING/NO SIGNAL",
    "DISREGARDING TRAFFIC SIGNALS",
    "DISREGARDING STOP SIGN",
    "DISTRACTION - FROM INSIDE VEHICLE",
    "UNDER THE INFLUENCE OF ALCOHOL/DRUGS",
    "EXCEEDING SAFE SPEED FOR CONDITIONS",
    "WEATHER",
    "NOT APPLICABLE",
  ],
  weather_condition: [
    "CLEAR",
    "CLOUDY/OVERCAST",
    "RAIN",
    "SNOW",
    "FOG/SMOKE/HAZE",
    "UNKNOWN",
  ],
  lighting_condition: [
    "DAYLIGHT",
    "DAWN",
    "DUSK",
    "DARKNESS",
    "DARKNESS, LIGHTED ROAD",
    "UNKNOWN",
  ],
  roadway_surface_cond: [
    "DRY",
    "WET",
    "SNOW OR SLUSH",
    "ICE",
    "SAND, MUD, DIRT",
    "UNKNOWN",
  ],
  traffic_control_device: [
    "NO CONTROLS",
    "TRAFFIC SIGNAL",
    "STOP SIGN/FLASHER",
    "YIELD",
    "LANE USE MARKING",
    "UNKNOWN",
  ],
  device_condition: [
    "FUNCTIONING PROPERLY",
    "NOT FUNCTIONING",
    "NO CONTROLS",
    "UNKNOWN",
  ],
  trafficway_type: [
    "NOT DIVIDED",
    "DIVIDED - W/MEDIAN (NOT RAISED)",
    "DIVIDED - W/MEDIAN BARRIER",
    "ONE-WAY",
    "PARKING LOT",
    "UNKNOWN",
  ],
  road_defect: [
    "NO DEFECTS",
    "RUT, HOLES",
    "WORN SURFACE",
    "DEBRIS ON ROADWAY",
    "UNKNOWN",
  ],
  alignment: [
    "STRAIGHT AND LEVEL",
    "STRAIGHT ON GRADE",
    "CURVE, LEVEL",
    "CURVE ON GRADE",
    "UNKNOWN",
  ],
};
