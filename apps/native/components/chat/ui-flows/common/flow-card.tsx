import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

interface FlowCardProps {
  iconName: string;
  iconColorVar?: string;
  iconBgClass?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function FlowIcon({
  iconName,
  iconColorVar,
}: {
  iconName: string;
  iconColorVar: string;
}) {
  const color = useCSSVariable(iconColorVar) as string;
  return <Feather name={iconName as any} size={20} color={color} />;
}

export function FlowCard({
  iconName,
  iconColorVar = "--color-primary",
  iconBgClass = "bg-primary/10",
  title,
  subtitle,
  children,
}: FlowCardProps) {
  return (
    <View className="w-full max-w-md flex-col gap-3">
      <View className="w-full flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        {/* Header */}
        <View className="flex-row items-start gap-3">
          <View
            className={`size-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}
          >
            <FlowIcon iconName={iconName} iconColorVar={iconColorVar} />
          </View>
          <View className="flex-1 flex-col gap-0.5">
            <Text className="text-base font-semibold leading-tight text-foreground">
              {title}
            </Text>
            {subtitle ? (
              <Text className="text-xs text-muted-foreground">{subtitle}</Text>
            ) : null}
          </View>
        </View>

        {children}
      </View>
    </View>
  );
}
