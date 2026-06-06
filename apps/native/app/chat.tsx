import { StyledSafeAreaView } from "@/components";
import { toolkit } from "@/components/chat/toolkit";
import { useAutoCancelInitiatedFlows, useChatRuntime } from "@/hooks";
import {
  AssistantRuntimeProvider,
  Tools,
  useAui,
} from "@assistant-ui/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Thread } from "../components/chat";

function ChatEventHandlers() {
  useAutoCancelInitiatedFlows();
  return null;
}

export default function ChatModal() {
  const runtime = useChatRuntime();
  const aui = useAui({ tools: Tools({ toolkit }) });

  return (
    <SafeAreaProvider>
      <AssistantRuntimeProvider runtime={runtime} aui={aui}>
        <ChatEventHandlers />
        <StyledSafeAreaView className="flex-1 bg-background">
          <Thread />
        </StyledSafeAreaView>
      </AssistantRuntimeProvider>
    </SafeAreaProvider>
  );
}
