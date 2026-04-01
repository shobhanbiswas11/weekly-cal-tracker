import { useAui } from "@assistant-ui/react";
import { useNavigate } from "react-router";
import { ONBOARDING_SYSTEM_PROMPT } from "./prompts/onboarding";

export function useInitOnBoarding() {
  const aui = useAui();
  const navigate = useNavigate();

  const init = () => {
    navigate("/chat");

    // TODO: Find a better way to do this after the thread is initialized instead of using a timeout
    setTimeout(() => {
      aui.thread().append({
        role: "system",
        content: [
          {
            type: "text",
            text: ONBOARDING_SYSTEM_PROMPT,
          },
        ],
      });
    }, 500);
  };

  return { init };
}
