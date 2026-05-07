import { useAppRuntime } from "@/hooks/use-app-runtime";
import type { ThreadMessage } from "@assistant-ui/react-native";
import {
  AssistantRuntimeProvider,
  useAui,
  useAuiState,
} from "@assistant-ui/react-native";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const C = {
  bg: "#FFFFFF",
  userBubble: "#F4F4F4",
  inputBg: "#F4F4F4",
  sendActive: "#1C1C1C",
  sendInactive: "#C8C8C8",
  border: "#E8E8E8",
  textPrimary: "#0D0D0D",
  textSecondary: "#6E6E80",
  accent: "#10A37F",
};

function Header() {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
        backgroundColor: C.bg,
      }}
    >
      <View style={{ width: 44 }} />
      <Text style={{ fontSize: 17, fontWeight: "600", color: C.textPrimary }}>
        Calorie Coach
      </Text>
      <Pressable onPress={() => router.back()}>
        <Text style={{ fontSize: 16, color: C.accent, fontWeight: "500" }}>
          Done
        </Text>
      </Pressable>
    </View>
  );
}

function AssistantAvatar() {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: C.accent,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        marginTop: 1,
        flexShrink: 0,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✦</Text>
    </View>
  );
}

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isUser = message.role === "user";
  const text = message.content
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("\n");

  if (!text) return null;

  if (isUser) {
    return (
      <View
        style={{
          alignSelf: "flex-end",
          backgroundColor: C.userBubble,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginVertical: 2,
          marginHorizontal: 16,
          maxWidth: "78%",
        }}
      >
        <Text style={{ color: C.textPrimary, fontSize: 16, lineHeight: 23 }}>
          {text}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginVertical: 2,
        maxWidth: "92%",
      }}
    >
      <AssistantAvatar />
      <Text
        style={{
          flex: 1,
          color: C.textPrimary,
          fontSize: 16,
          lineHeight: 24,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 60,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: C.accent,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 22,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>
          ✦
        </Text>
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          color: C.textPrimary,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        How can I help you?
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: C.textSecondary,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        Ask me about your calories, macros, or nutrition goals.
      </Text>
    </View>
  );
}

function Composer() {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);
  const isEmpty = useAuiState((s) => s.composer.isEmpty);

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
        backgroundColor: C.bg,
        borderTopWidth: 0.5,
        borderTopColor: C.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          backgroundColor: C.inputBg,
          borderRadius: 26,
          paddingLeft: 18,
          paddingRight: 6,
          paddingVertical: 6,
          minHeight: 52,
        }}
      >
        <TextInput
          value={text}
          onChangeText={(t) => aui.composer().setText(t)}
          placeholder="Message"
          placeholderTextColor={C.textSecondary}
          multiline
          style={{
            flex: 1,
            fontSize: 16,
            color: C.textPrimary,
            lineHeight: 22,
            maxHeight: 120,
            paddingVertical: 6,
          }}
        />
        <Pressable
          onPress={() => aui.composer().send()}
          disabled={isEmpty}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isEmpty ? C.sendInactive : C.sendActive,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 8,
            alignSelf: "flex-end",
            marginBottom: 2,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "700",
              marginTop: -1,
            }}
          >
            ↑
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ChatContent() {
  const messages = useAuiState(
    (s) => s.thread.messages,
  ) as readonly ThreadMessage[];

  const { height } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: -height.value,
  }));

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: C.bg }, animatedStyle]}>
      <Header />
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={messages}
          extraData={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
          keyboardDismissMode="interactive"
        />
      )}
      <Composer />
    </Animated.View>
  );
}

export default function ChatModal() {
  const runtime = useAppRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top"]}>
        <ChatContent />
      </SafeAreaView>
    </AssistantRuntimeProvider>
  );
}
