import { StyledSafeAreaView } from "@/components";
import { Thread } from "@/components/chat";
import { useAssistantRuntime } from "@/hooks/use-assistant-runtime";
import { AssistantRuntimeProvider } from "@assistant-ui/react-native";

export default function ChatModal() {
  const runtime = useAssistantRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <StyledSafeAreaView className="flex-1 bg-background">
        <Thread />
      </StyledSafeAreaView>
    </AssistantRuntimeProvider>
  );
}
