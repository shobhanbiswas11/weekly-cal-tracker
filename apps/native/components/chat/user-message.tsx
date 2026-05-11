import {
  ActionBarPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

export function UserMessage() {
  const [showActions, setShowActions] = useState(false);
  const iconColor = useCSSVariable("--color-muted-foreground") as string;

  return (
    <MessagePrimitive.Root>
      <View className="flex-row items-center justify-end mx-4 my-0.5">
        {/* Bubble with absolutely-positioned pencil icon to its left */}
        <View className="relative items-end" style={{ maxWidth: "78%" }}>
          {showActions && (
            <ActionBarPrimitive.Edit
              style={{
                position: "absolute",
                left: -40,
                top: "50%",
                transform: [{ translateY: -16 }],
                zIndex: 10,
              }}
            >
              <View className="w-8 h-8 rounded-full justify-center items-center bg-muted">
                <Feather name="edit-2" size={14} color={iconColor} />
              </View>
            </ActionBarPrimitive.Edit>
          )}
          <Pressable
            onPress={() => setShowActions((v) => !v)}
            className="bg-card rounded-xl px-4 py-2.5"
          >
            <MessagePrimitive.Content
              renderText={({ part }) => (
                <Text className="text-foreground text-base leading-5.75">
                  {part.text}
                </Text>
              )}
            />
          </Pressable>
        </View>
      </View>
    </MessagePrimitive.Root>
  );
}

export function EditComposer() {
  const placeholderColor = useCSSVariable("--color-muted-foreground") as string;

  return (
    <MessagePrimitive.Root>
      <View className="mx-4 my-1 self-end w-[85%] bg-card rounded-2xl">
        <ComposerPrimitive.EditInput
          placeholder="Edit message..."
          placeholderTextColor={placeholderColor}
          multiline
          className="text-base text-foreground leading-5.5 px-4 pt-3 pb-2 max-h-30"
        />
        <View className="flex-row justify-end gap-2 px-3 pb-3">
          <ComposerPrimitive.EditCancel>
            <Text className="text-sm text-muted-foreground px-3 py-1.5">
              Cancel
            </Text>
          </ComposerPrimitive.EditCancel>
          <ComposerPrimitive.EditSend>
            <View className="bg-fill rounded-lg px-3 py-1.5">
              <Text className="text-sm text-fill-foreground font-medium">
                Save
              </Text>
            </View>
          </ComposerPrimitive.EditSend>
        </View>
      </View>
    </MessagePrimitive.Root>
  );
}
