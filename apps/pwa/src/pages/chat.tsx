import { Thread } from "@/components/assistant-ui/thread";
import { useDashboard } from "@/hooks/dashboard";
import { useAssistantInstructions } from "@assistant-ui/react";
import { getSystemPrompt } from "@weekly-cal/core";

export default function ChatPage() {
  const { data } = useDashboard();

  useAssistantInstructions(
    getSystemPrompt({
      userProfile: data?.profile ?? undefined,
      currentWeekEntries: data?.entries,
    }),
  );

  return <Thread />;
}
