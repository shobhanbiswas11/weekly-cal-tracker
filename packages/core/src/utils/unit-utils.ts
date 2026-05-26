import type { HeightUnit, WeightUnit } from "../constants";

/**
 * Formats a height stored in cm into a display string based on the preferred unit.
 * "cm" → "173 cm"
 * "ft" → "5'8""
 */
export function formatHeight(cm: number, unit: HeightUnit): string {
  if (unit === "ft") {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(cm)} cm`;
}

/**
 * Formats a weight stored in kg into a display string based on the preferred unit.
 * "kg" → "70 kg"
 * "lbs" → "154 lbs"
 */
export function formatWeight(kg: number, unit: WeightUnit): string {
  if (unit === "lbs") {
    return `${Math.round(kg * 2.20462)} lbs`;
  }
  return `${Math.round(kg)} kg`;
}

// ---------------------------------------------------------------------------
// Numeric conversion helpers (for form inputs)
// For "ft" preference, height is expressed as total inches in input fields.
// ---------------------------------------------------------------------------

/** Convert stored cm to the edit-field value (cm or total inches). */
export function heightFromCm(cm: number, unit: HeightUnit): number {
  return unit === "ft" ? Math.round(cm / 2.54) : Math.round(cm);
}

/** Convert edit-field value back to cm for storage. */
export function heightToCm(value: number, unit: HeightUnit): number {
  return unit === "ft" ? value * 2.54 : value;
}

/** Convert stored kg to the edit-field value (kg or lbs). */
export function weightFromKg(kg: number, unit: WeightUnit): number {
  return unit === "lbs" ? Math.round(kg * 2.20462) : Math.round(kg);
}

/** Convert edit-field value back to kg for storage. */
export function weightToKg(value: number, unit: WeightUnit): number {
  return unit === "lbs" ? value / 2.20462 : value;
}

/** Human-readable input label for height, given the preference. */
export function heightUnitLabel(unit: HeightUnit): string {
  return unit === "ft" ? "in" : "cm";
}

/** Human-readable input label for weight, given the preference. */
export function weightUnitLabel(unit: WeightUnit): string {
  return unit;
}
