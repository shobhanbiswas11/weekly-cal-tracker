import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface FlowActionButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export function FlowActionButtons({
  onCancel,
  onConfirm,
  cancelLabel = "Discard",
  confirmLabel = "Confirm",
  isDestructive = false,
  loading = false,
}: FlowActionButtonsProps) {
  return (
    <View className="flex-row justify-end gap-2 pt-1">
      <Pressable
        onPress={onCancel}
        disabled={loading}
        className="rounded-lg px-4 py-2 active:opacity-70"
      >
        <Text className="text-sm font-medium text-muted-foreground">
          {cancelLabel}
        </Text>
      </Pressable>
      <Pressable
        onPress={onConfirm}
        disabled={loading}
        className={`min-w-[72px] flex-row items-center justify-center gap-2 rounded-lg px-4 py-2 active:opacity-80 ${
          isDestructive ? "bg-destructive" : "bg-primary"
        } ${loading ? "opacity-70" : ""}`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-sm font-medium text-primary-foreground">
            {confirmLabel}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
