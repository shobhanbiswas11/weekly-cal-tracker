import { useAui } from "@assistant-ui/react";
import { useNavigate } from "react-router";
import { ONBOARDING_SYSTEM_PROMPT } from "./prompts/onboarding";

export function useInitOnBoarding() {
  const aui = useAui();
  const navigate = useNavigate();

  const init = () => {
    aui.thread().append({
      role: "system",
      content: [
        {
          type: "text",
          text: ONBOARDING_SYSTEM_PROMPT,
        },
      ],
    });
    navigate("/chat");
  };

  return { init };
}
