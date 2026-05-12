import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { ToolUIWrapper } from "./tool-wrapper";

type Variant = "success" | "error" | "cancelled";

const variantIconName: Record<Variant, string> = {
  success: "check",
  error: "alert-circle",
  cancelled: "x",
};

const variantIconColorVar: Record<Variant, string> = {
  success: "--color-primary",
  error: "--color-destructive",
  cancelled: "--color-muted-foreground",
};

const variantBgClass: Record<Variant, string> = {
  success: "bg-primary/10",
  error: "bg-destructive/10",
  cancelled: "bg-muted",
};

function VariantIcon({ variant }: { variant: Variant }) {
  const color = useCSSVariable(variantIconColorVar[variant]) as string;
  return (
    <Feather name={variantIconName[variant] as any} size={16} color={color} />
  );
}

export function ReceiptCard({
  icon,
  title,
  subtitle,
  variant = "success",
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  variant?: Variant;
}) {
  return (
    <ToolUIWrapper>
      <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
        <View
          className={`size-8 shrink-0 items-center justify-center rounded-full ${variantBgClass[variant]}`}
        >
          {icon ?? <VariantIcon variant={variant} />}
        </View>
        <View className="flex-1 flex-col">
          <Text className="text-sm font-medium text-foreground">{title}</Text>
          {subtitle ? (
            <Text className="text-sm text-muted-foreground">{subtitle}</Text>
          ) : null}
        </View>
      </View>
    </ToolUIWrapper>
  );
}
