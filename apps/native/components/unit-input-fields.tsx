/**
 * Self-contained unit-switching input components for height and weight.
 *
 * - HeightInputField: tabs between "cm" and "ft / in"; always calls back in cm.
 * - WeightInputField: tabs between "kg" and "lbs"; always calls back in kg.
 *
 * Both keep the non-active unit's display value in sync as the user types, so
 * switching tabs shows an already-converted value.
 */
import type { HeightUnit, WeightUnit } from "@weekly-cal/core";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCSSVariable } from "uniwind";

// ---------------------------------------------------------------------------
// Internal conversion helpers (raw — not rounded for intermediate state)
// ---------------------------------------------------------------------------

function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

function ftInToCm(feet: number, inches: number): string {
  const totalInches = feet * 12 + inches;
  const cm = Math.round(totalInches * 2.54 * 10) / 10;
  return String(cm);
}

function kgToLbsStr(kg: number): string {
  return String(Math.round(kg * 2.20462));
}

function lbsToKgStr(lbs: number): string {
  return String(Math.round((lbs / 2.20462) * 10) / 10);
}

// ---------------------------------------------------------------------------
// Shared segmented-control tab bar
// ---------------------------------------------------------------------------

function UnitTabBar<T extends string>({
  tabs,
  labels,
  active,
  onChange,
}: {
  tabs: readonly [T, T];
  labels: [string, string];
  active: T;
  onChange: (tab: T) => void;
}) {
  const selectedBg = useCSSVariable("--color-background") as string;
  const primaryColor = useCSSVariable("--color-primary") as string;

  return (
    <View className="flex-row bg-muted rounded-xl p-1 mb-3">
      {(tabs as [T, T]).map((tab, i) => (
        <TouchableOpacity
          key={tab}
          activeOpacity={0.8}
          onPress={() => onChange(tab)}
          style={{
            flex: 1,
            paddingVertical: 7,
            borderRadius: 9,
            alignItems: "center",
            backgroundColor: active === tab ? selectedBg : "transparent",
            borderWidth: active === tab ? 1.5 : 0,
            borderColor: active === tab ? primaryColor : "transparent",
          }}
        >
          <Text
            className={`text-sm font-semibold ${active === tab ? "text-primary" : "text-muted-foreground"}`}
          >
            {labels[i]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// HeightInputField
// ---------------------------------------------------------------------------

export type HeightInputFieldProps = {
  /** Canonical height stored in cm, expressed as a string. Empty string = unset. */
  value: string;
  onChange: (cmValue: string) => void;
  onBlur?: () => void;
  /** Sets the initially-active tab. Defaults to "cm". */
  defaultUnit?: HeightUnit;
  foregroundColor: string;
  placeholderColor: string;
  error?: string;
};

export function HeightInputField({
  value,
  onChange,
  onBlur,
  defaultUnit = "cm",
  foregroundColor,
  placeholderColor,
  error,
}: HeightInputFieldProps) {
  // Initialise all display strings from the canonical cm value on mount.
  const initCm = parseFloat(value);
  const validInit = !isNaN(initCm) && initCm > 0;

  const [activeUnit, setActiveUnit] = useState<HeightUnit>(defaultUnit);

  const [cmText, setCmText] = useState(() =>
    validInit ? String(Math.round(initCm)) : value,
  );
  const [feetText, setFeetText] = useState(() => {
    if (!validInit) return "";
    return String(cmToFtIn(initCm).feet);
  });
  const [inchesText, setInchesText] = useState(() => {
    if (!validInit) return "";
    return String(cmToFtIn(initCm).inches);
  });

  // ── Tab switching ────────────────────────────────────────────────────────

  function handleTabChange(unit: HeightUnit) {
    if (unit === activeUnit) return;

    if (unit === "ft") {
      // cm → ft/in  (display only; canonical value stays the same)
      const cm = parseFloat(cmText);
      if (!isNaN(cm) && cm > 0) {
        const { feet, inches } = cmToFtIn(cm);
        setFeetText(String(feet));
        setInchesText(String(inches));
      }
    } else {
      // ft/in → cm
      const ft = parseInt(feetText, 10);
      const inc = parseInt(inchesText, 10);
      if (!isNaN(ft) && !isNaN(inc)) {
        const cmStr = ftInToCm(ft, inc);
        setCmText(cmStr);
        onChange(cmStr);
      }
    }

    setActiveUnit(unit);
  }

  // ── Field handlers ───────────────────────────────────────────────────────

  function handleCmChange(text: string) {
    setCmText(text);
    const cm = parseFloat(text);
    if (!isNaN(cm) && cm > 0) {
      const { feet, inches } = cmToFtIn(cm);
      setFeetText(String(feet));
      setInchesText(String(inches));
    }
    onChange(text);
  }

  function handleFeetChange(text: string) {
    setFeetText(text);
    const ft = parseInt(text, 10);
    const inc = parseInt(inchesText, 10);
    if (!isNaN(ft) && ft >= 0 && !isNaN(inc)) {
      const cmStr = ftInToCm(ft, inc);
      setCmText(cmStr);
      onChange(cmStr);
    }
  }

  function handleInchesChange(text: string) {
    setInchesText(text);
    const ft = parseInt(feetText, 10);
    const inc = parseInt(text, 10);
    if (!isNaN(ft) && !isNaN(inc) && inc >= 0 && inc < 12) {
      const cmStr = ftInToCm(ft, inc);
      setCmText(cmStr);
      onChange(cmStr);
    }
  }

  const inputStyle = {
    color: foregroundColor,
    fontSize: 15,
    paddingVertical: 2,
  } as const;

  return (
    <View>
      <UnitTabBar
        tabs={["cm", "ft"] as const}
        labels={["cm", "ft / in"]}
        active={activeUnit}
        onChange={handleTabChange}
      />

      {activeUnit === "cm" ? (
        <View className="rounded-2xl bg-card border border-border px-4 py-3">
          <Text className="text-xs text-muted-foreground mb-1">
            Height (cm)
          </Text>
          <TextInput
            value={cmText}
            onChangeText={handleCmChange}
            onBlur={onBlur}
            placeholder="e.g. 175"
            placeholderTextColor={placeholderColor}
            keyboardType="decimal-pad"
            style={inputStyle}
          />
        </View>
      ) : (
        <View className="rounded-2xl bg-card border border-border px-4 py-3">
          <Text className="text-xs text-muted-foreground mb-2">
            Height (ft / in)
          </Text>
          <View className="flex-row gap-6">
            <View className="flex-1">
              <TextInput
                value={feetText}
                onChangeText={handleFeetChange}
                onBlur={onBlur}
                placeholder="5"
                placeholderTextColor={placeholderColor}
                keyboardType="number-pad"
                style={inputStyle}
              />
              <Text className="text-xs text-muted-foreground mt-1">ft</Text>
            </View>
            <View className="flex-1">
              <TextInput
                value={inchesText}
                onChangeText={handleInchesChange}
                onBlur={onBlur}
                placeholder="8"
                placeholderTextColor={placeholderColor}
                keyboardType="number-pad"
                style={inputStyle}
              />
              <Text className="text-xs text-muted-foreground mt-1">in</Text>
            </View>
          </View>
        </View>
      )}

      {error && (
        <Text className="text-xs text-destructive mt-1 px-1">{error}</Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// WeightInputField
// ---------------------------------------------------------------------------

export type WeightInputFieldProps = {
  /** Canonical weight stored in kg, expressed as a string. Empty string = unset. */
  value: string;
  onChange: (kgValue: string) => void;
  onBlur?: () => void;
  /** Sets the initially-active tab. Defaults to "kg". */
  defaultUnit?: WeightUnit;
  foregroundColor: string;
  placeholderColor: string;
  error?: string;
};

export function WeightInputField({
  value,
  onChange,
  onBlur,
  defaultUnit = "kg",
  foregroundColor,
  placeholderColor,
  error,
}: WeightInputFieldProps) {
  const initKg = parseFloat(value);
  const validInit = !isNaN(initKg) && initKg > 0;

  const [activeUnit, setActiveUnit] = useState<WeightUnit>(defaultUnit);

  const [kgText, setKgText] = useState(() =>
    validInit ? String(Math.round(initKg)) : value,
  );
  const [lbsText, setLbsText] = useState(() => {
    if (!validInit) return "";
    return kgToLbsStr(initKg);
  });

  // ── Tab switching ────────────────────────────────────────────────────────

  function handleTabChange(unit: WeightUnit) {
    if (unit === activeUnit) return;

    if (unit === "lbs") {
      // kg → lbs  (display only; canonical value stays the same)
      const kg = parseFloat(kgText);
      if (!isNaN(kg) && kg > 0) {
        setLbsText(kgToLbsStr(kg));
      }
    } else {
      // lbs → kg
      const lbs = parseFloat(lbsText);
      if (!isNaN(lbs) && lbs > 0) {
        const kgStr = lbsToKgStr(lbs);
        setKgText(kgStr);
        onChange(kgStr);
      }
    }

    setActiveUnit(unit);
  }

  // ── Field handlers ───────────────────────────────────────────────────────

  function handleKgChange(text: string) {
    setKgText(text);
    const kg = parseFloat(text);
    if (!isNaN(kg) && kg > 0) {
      setLbsText(kgToLbsStr(kg));
    }
    onChange(text);
  }

  function handleLbsChange(text: string) {
    setLbsText(text);
    const lbs = parseFloat(text);
    if (!isNaN(lbs) && lbs > 0) {
      const kgStr = lbsToKgStr(lbs);
      setKgText(kgStr);
      onChange(kgStr);
    }
  }

  const isKg = activeUnit === "kg";
  const inputStyle = {
    color: foregroundColor,
    fontSize: 15,
    paddingVertical: 2,
  } as const;

  return (
    <View>
      <UnitTabBar
        tabs={["kg", "lbs"] as const}
        labels={["kg", "lbs"]}
        active={activeUnit}
        onChange={handleTabChange}
      />

      <View className="rounded-2xl bg-card border border-border px-4 py-3">
        <Text className="text-xs text-muted-foreground mb-1">
          {isKg ? "Weight (kg)" : "Weight (lbs)"}
        </Text>
        <TextInput
          value={isKg ? kgText : lbsText}
          onChangeText={isKg ? handleKgChange : handleLbsChange}
          onBlur={onBlur}
          placeholder={isKg ? "e.g. 70" : "e.g. 154"}
          placeholderTextColor={placeholderColor}
          keyboardType="decimal-pad"
          style={inputStyle}
        />
      </View>

      {error && (
        <Text className="text-xs text-destructive mt-1 px-1">{error}</Text>
      )}
    </View>
  );
}
