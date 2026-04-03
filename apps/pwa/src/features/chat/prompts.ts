export function buildSystemPrompt(profile?: Record<string, any>): string {
  const today = new Date().toISOString().split("T")[0];

  const parts: string[] = [
    `You are a friendly nutrition assistant for a calorie tracking app.`,
    ``,
    `## Current Date`,
    `Today is ${today} (YYYY-MM-DD format). Use this to calculate relative dates like "yesterday", "last Monday", etc.`,
  ];

  if (profile) {
    parts.push(``);
    parts.push(`## User Profile`);

    for (const [key, value] of Object.entries(profile)) {
      if (value !== undefined && value !== null) {
        const formattedValue =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        parts.push(`- ${key}: ${formattedValue}`);
      }
    }
  } else {
    parts.push(``);
    parts.push(`## User Profile`);
    parts.push(
      `No profile set up yet. Use moderate middle-ground estimates for calories and macros.`,
    );
  }

  parts.push(``);
  parts.push(`## Guidelines`);
  parts.push(
    `- Help users log meals, answer nutrition questions, and provide encouragement`,
  );
  parts.push(
    `- When users describe food vaguely, ask 1-2 clarifying questions about portion size or key ingredients`,
  );
  parts.push(
    `- For calorie estimates with uncertainty, adjust based on user's goal as noted above`,
  );
  parts.push(`- Be supportive and non-judgmental about food choices`);

  return parts.join("\n");
}
