/**
 * Form component for crash severity prediction inputs using TanStack Form + Zod.
 */

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  type PredictionRequest,
  type FeatureOptions,
  PredictionRequestSchema,
  DEFAULT_PREDICTION_REQUEST,
  DEFAULT_FEATURE_OPTIONS,
} from "@/types/prediction";

type PredictionFormProps = {
  featureOptions: FeatureOptions | null;
  onSubmit: (data: PredictionRequest) => void;
  onReset: () => void;
  isLoading: boolean;
};

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

type FieldErrorProps = {
  errors: string[];
};

function FieldError({ errors }: FieldErrorProps) {
  if (errors.length === 0) return null;
  return (
    <p className="text-xs text-destructive mt-1">
      {errors[0]}
    </p>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  errors: string[];
  min?: number;
  max?: number;
  step?: number;
  formKey?: number;
};

function NumberField({
  label,
  value,
  onChange,
  onBlur,
  errors,
  min,
  max,
  step = 1,
  formKey = 0,
}: NumberFieldProps) {
  const [displayValue, setDisplayValue] = useState(String(value));
  const [lastFormKey, setLastFormKey] = useState(formKey);

  // Reset display value when form is reset (formKey changes)
  if (formKey !== lastFormKey) {
    setDisplayValue(String(value));
    setLastFormKey(formKey);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setDisplayValue(rawValue);
    
    // Only update form state if it's a valid number
    if (rawValue !== "" && !isNaN(Number(rawValue))) {
      onChange(Number(rawValue));
    }
  };

  const handleBlur = () => {
    // On blur, if empty, reset to current form value
    if (displayValue === "" || isNaN(Number(displayValue))) {
      setDisplayValue(String(value));
    }
    onBlur();
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        className="h-8 text-xs"
      />
      <FieldError errors={errors} />
    </div>
  );
}

export function PredictionForm({
  featureOptions,
  onSubmit,
  onReset,
  isLoading,
}: PredictionFormProps) {
  const options = featureOptions || DEFAULT_FEATURE_OPTIONS;
  const [formKey, setFormKey] = useState(0);

  const form = useForm({
    defaultValues: DEFAULT_PREDICTION_REQUEST,
    onSubmit: async ({ value }) => {
      // Validate with Zod before submitting
      const result = PredictionRequestSchema.safeParse(value);
      if (result.success) {
        onSubmit(result.data);
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = PredictionRequestSchema.safeParse(value);
        if (!result.success) {
          return result.error.issues[0]?.message || "Validation failed";
        }
        return undefined;
      },
    },
  });

  const handleReset = () => {
    form.reset();
    setFormKey((k) => k + 1); // Trigger re-sync of NumberField components
    onReset();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {/* Crash Information */}
      <FormSection title="Crash Information">
        <div className="grid grid-cols-2 gap-2">
          <form.Field name="person_count">
            {(field) => (
              <NumberField
                label="People Involved"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={1}
                max={50}
                formKey={formKey}
              />
            )}
          </form.Field>

          <form.Field name="vehicle_count">
            {(field) => (
              <NumberField
                label="Vehicles Involved"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={1}
                max={20}
                formKey={formKey}
              />
            )}
          </form.Field>
        </div>

        <form.Field name="first_crash_type">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Crash Type</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.first_crash_type.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <form.Field name="damage">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Damage Level</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.damage.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <form.Field name="prim_contributory_cause">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Primary Cause</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.prim_contributory_cause.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>
      </FormSection>

      <Separator />

      {/* People Information */}
      <FormSection title="People Information">
        <div className="grid grid-cols-2 gap-2">
          <form.Field name="age_mean">
            {(field) => (
              <NumberField
                label="Avg Age"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={0}
                max={120}
                formKey={formKey}
              />
            )}
          </form.Field>

          <form.Field name="driver_count">
            {(field) => (
              <NumberField
                label="Drivers"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={0}
                max={20}
                formKey={formKey}
              />
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <form.Field name="age_min">
            {(field) => (
              <NumberField
                label="Min Age"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={0}
                max={120}
                formKey={formKey}
              />
            )}
          </form.Field>

          <form.Field name="age_max">
            {(field) => (
              <NumberField
                label="Max Age"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={0}
                max={120}
                formKey={formKey}
              />
            )}
          </form.Field>
        </div>
      </FormSection>

      <Separator />

      {/* Vehicle Information */}
      <FormSection title="Vehicle Information">
        <div className="grid grid-cols-2 gap-2">
          <form.Field name="avg_vehicle_year">
            {(field) => (
              <NumberField
                label="Avg Year"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={1900}
                max={2030}
                formKey={formKey}
              />
            )}
          </form.Field>

          <form.Field name="oldest_vehicle_year">
            {(field) => (
              <NumberField
                label="Oldest Year"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={1900}
                max={2030}
                formKey={formKey}
              />
            )}
          </form.Field>
        </div>
      </FormSection>

      <Separator />

      {/* Road Conditions */}
      <FormSection title="Road Conditions">
        <form.Field name="posted_speed_limit">
          {(field) => (
            <NumberField
              label="Speed Limit (mph)"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errors={field.state.meta.errors.map((e) => String(e))}
              min={0}
              max={100}
              formKey={formKey}
            />
          )}
        </form.Field>

        <form.Field name="traffic_control_device">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Traffic Control</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.traffic_control_device.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <form.Field name="device_condition">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Device Condition</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.device_condition.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <form.Field name="trafficway_type">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Trafficway Type</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.trafficway_type.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <form.Field name="lighting_condition">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Lighting</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.lighting_condition.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <form.Field name="roadway_surface_cond">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Road Surface</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.roadway_surface_cond.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <form.Field name="road_defect">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Road Defect</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.road_defect.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <form.Field name="alignment">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Alignment</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.alignment.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>
      </FormSection>

      <Separator />

      {/* Weather Conditions */}
      <FormSection title="Weather Conditions">
        <form.Field name="weather_condition">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs">Weather</Label>
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.weather_condition.map((option) => (
                    <SelectItem key={option} value={option} className="text-xs">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={field.state.meta.errors.map(e => String(e))} />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-2">
          <form.Field name="air_temperature">
            {(field) => (
              <NumberField
                label="Temp (F)"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={-50}
                max={150}
                formKey={formKey}
              />
            )}
          </form.Field>

          <form.Field name="humidity">
            {(field) => (
              <NumberField
                label="Humidity (%)"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={0}
                max={100}
                formKey={formKey}
              />
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <form.Field name="wind_speed">
            {(field) => (
              <NumberField
                label="Wind (mph)"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={0}
                max={200}
                formKey={formKey}
              />
            )}
          </form.Field>

          <form.Field name="rain_intensity">
            {(field) => (
              <NumberField
                label="Rain Intensity"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={0}
                max={10}
                step={0.1}
                formKey={formKey}
              />
            )}
          </form.Field>
        </div>
      </FormSection>

      <Separator />

      {/* Time Information */}
      <FormSection title="Time Information">
        <div className="grid grid-cols-3 gap-2">
          <form.Field name="crash_hour">
            {(field) => (
              <NumberField
                label="Hour (0-23)"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={0}
                max={23}
                formKey={formKey}
              />
            )}
          </form.Field>

          <form.Field name="crash_day_of_week">
            {(field) => (
              <NumberField
                label="Day (1-7)"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={1}
                max={7}
                formKey={formKey}
              />
            )}
          </form.Field>

          <form.Field name="crash_month">
            {(field) => (
              <NumberField
                label="Month"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors.map((e) => String(e))}
                min={1}
                max={12}
                formKey={formKey}
              />
            )}
          </form.Field>
        </div>
      </FormSection>

      <Separator />

      {/* Submit buttons */}
      <div className="flex gap-2 pt-2">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isLoading || isSubmitting}
              className="flex-1"
              size="sm"
            >
              {isLoading || isSubmitting ? "Predicting..." : "Predict"}
            </Button>
          )}
        </form.Subscribe>
        <Button
          type="button"
          onClick={handleReset}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
