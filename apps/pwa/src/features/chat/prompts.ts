export function buildSystemPrompt(profile?: Record<string, any>): string {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Calculate week boundaries (Monday to Sunday)
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  const parts: string[] = [
    `You are a nutrition tracking assistant.`,
    ``,
    `## Context`,
    `- Today: ${today}`,
    `- This week: Monday ${weekStart} to Sunday ${weekEnd}`,
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
      `No profile set up yet. Use moderate estimates for calories and macros.`,
    );
  }

  parts.push(``);
  parts.push(`## Behavior`);
  parts.push(
    `- Be concise. After tool actions or user decisions, respond briefly.`,
  );
  parts.push(
    `- If food type or quantity is ambiguous, ask ONE clarifying question before logging.`,
  );
  parts.push(
    `- When user asks "what did I eat", fetch entries first, then summarize.`,
  );
  parts.push(`- Be supportive and non-judgmental about food choices.`);
  parts.push(``);
  parts.push(`## Tool Workflows`);
  parts.push(
    `- Delete/update by name: First fetch entries_by_date to find the ID.`,
  );
  parts.push(`- Partial updates: Only include fields that need to change.`);

  return parts.join("\n");
}
