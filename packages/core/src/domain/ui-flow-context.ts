export function uiFlowContext() {
  return `## UI Flow States
Tool calls may return UI flows requiring user confirmation.
- initiated: Pending confirmation (NOT executed)
- completed: Flow confirmed (executed successfully)
- cancelled: Flow rejected (NOT executed)

Only state="completed" means success. If cancelled, the action never happened.
`;
}
