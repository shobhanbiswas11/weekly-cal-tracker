import { StyledSafeAreaView } from "@/components";
import { ThreadListModal } from "@/components/chat/thread-list-modal";
import { toolkit } from "@/components/chat/toolkit";
import { useAssistantRuntime, useAutoCancelInitiatedFlows } from "@/hooks";
import {
  AssistantRuntimeProvider,
  Tools,
  useAui,
} from "@assistant-ui/react-native";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Thread } from "../components/chat";

function ChatEventHandlers() {
  useAutoCancelInitiatedFlows();
  return null;
}

export default function ChatModal() {
  const runtime = useAssistantRuntime();
  const aui = useAui({ tools: Tools({ toolkit }) });
  const [threadListVisible, setThreadListVisible] = useState(false);

  return (
    <SafeAreaProvider>
      <AssistantRuntimeProvider runtime={runtime} aui={aui}>
        <ChatEventHandlers />
        <StyledSafeAreaView className="flex-1 bg-background">
          <Thread onOpenThreadList={() => setThreadListVisible(true)} />
        </StyledSafeAreaView>
        <ThreadListModal
          visible={threadListVisible}
          onClose={() => setThreadListVisible(false)}
        />
      </AssistantRuntimeProvider>
    </SafeAreaProvider>
  );
}
