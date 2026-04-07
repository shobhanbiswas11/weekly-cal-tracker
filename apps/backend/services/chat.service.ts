import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { schemaCreateProfile } from "@weekly-cal/core";
import { convertToModelMessages, streamText, StreamTextResult, tool } from "ai";
import { profileRepo } from "../repo/profile-dynamodb.repo";

const SYSTEM_PROMPT = `You are a friendly nutrition assistant for a calorie tracking app. Help users log their meals, answer nutrition questions, and provide encouragement.`;
export async function streamChat(
  messages: any,
  tools: any,
): Promise<StreamTextResult<any, any>> {
  const result = streamText({
    model: openai("gpt-4o"),
    system: SYSTEM_PROMPT,
    tools: {
      ...frontendTools(tools),
      create_profile: tool({
        description:
          "Create the user profile with given and calculated information",
        inputSchema: schemaCreateProfile,
        execute: async (data) => {
          const profile = await profileRepo.create("test-user", data);
          console.log(profile);

          return profile;
        },
        needsApproval: true,
      }),
      update_profile: tool({
        description:
          "Update the user profile with given and calculated information",
        inputSchema: schemaCreateProfile,
        execute: async (data) => {
          return profileRepo.update("test-user", data);
        },
        needsApproval: true,
      }),
    },
    messages: await convertToModelMessages(messages),
  });

  return result;
}
