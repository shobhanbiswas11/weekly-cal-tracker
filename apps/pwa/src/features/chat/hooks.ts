import { useAui } from "@assistant-ui/react";
import { useNavigate } from "react-router";

export function useRedirectToChatWithSystemMessage(message: string) {
  const aui = useAui();
  const navigate = useNavigate();

  const redirect = () => {
    navigate("/chat");

    // TODO: Find a better way to do this after the thread is initialized instead of using a timeout
    setTimeout(() => {
      aui.thread().append({
        role: "system",
        content: [
          {
            type: "text",
            text: message,
          },
        ],
      });
    }, 100);
  };

  return { redirect };
}

export function useClearChat() {
  return () => {};
}
