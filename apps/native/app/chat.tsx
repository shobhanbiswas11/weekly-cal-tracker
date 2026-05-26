import { StyledSafeAreaView } from "@/components";
import { toolkit } from "@/components/chat/toolkit";
import { useAssistantRuntime, useAutoCancelInitiatedFlows } from "@/hooks";
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
  const runtime = useAssistantRuntime();
  const aui = useAui({ tools: Tools({ toolkit }) });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <ChatEventHandlers />
      <SafeAreaProvider>
        <StyledSafeAreaView className="flex-1 bg-background">
          <Thread />
        </StyledSafeAreaView>
      </SafeAreaProvider>
    </AssistantRuntimeProvider>
  );
}
