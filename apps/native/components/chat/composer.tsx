import { AuiIf, ComposerPrimitive, useAui } from "@assistant-ui/react-native";
import { useCallback, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useCSSVariable } from "uniwind";

export function Composer() {
  const aui = useAui();
  const placeholderColor = useCSSVariable("--color-muted-foreground");
  const inputRef = useRef<TextInput>(null);
  const textRef = useRef("");
  const [hasText, setHasText] = useState(false);

  const handleChangeText = useCallback((t: string) => {
    textRef.current = t;
    setHasText(t.length > 0);
  }, []);

  const handleSend = useCallback(() => {
    const t = textRef.current.trim();
    if (!t) return;
    aui.composer().setText(t);
    aui.composer().send();
    inputRef.current?.clear();
    textRef.current = "";
    setHasText(false);
  }, [aui]);

  return (
    <View className="px-4 pt-2.5 pb-2 bg-background border-t border-border">
      <View className="flex-row items-center bg-card rounded-2xl pl-4.5 pr-1.5 py-1.5 min-h-13">
        <TextInput
          ref={inputRef}
          onChangeText={handleChangeText}
          placeholder="3 eggs for breakfast.."
          placeholderTextColor={placeholderColor as string}
          multiline
          className="flex-1 text-base text-foreground leading-5.5 max-h-30 py-1.5"
        />
        <AuiIf condition={(s) => !s.thread.isRunning}>
          <Pressable
            onPress={handleSend}
            disabled={!hasText}
            className={`w-9 h-9 rounded-full justify-center items-center ml-2 self-end mb-0.5 ${hasText ? "bg-fill" : "bg-fill-disabled"}`}
          >
            <Text className="text-fill-foreground text-lg font-bold -mt-px">
              ↑
            </Text>
          </Pressable>
        </AuiIf>
        <AuiIf condition={(s) => s.thread.isRunning}>
          <ComposerPrimitive.Cancel>
            <View className="w-9 h-9 rounded-full justify-center items-center ml-2 self-end mb-0.5 bg-fill">
              <View className="w-3.5 h-3.5 rounded-sm bg-fill-foreground" />
            </View>
          </ComposerPrimitive.Cancel>
        </AuiIf>
      </View>
    </View>
  );
}
