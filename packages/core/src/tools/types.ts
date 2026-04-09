import type { z } from "zod";

/**
 * Approval configuration for tools that require user confirmation
 */
export type ToolApproval =
  | { require: false }
  | { require: true; confirmLabel: string; cancelLabel: string };

/**
 * Base tool definition structure
 */
export interface ToolDefinition<
  TInputSchema extends z.ZodTypeAny = z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny = z.ZodTypeAny,
> {
  name: string;
  title: string;
  description: string;
  inputSchema: TInputSchema;
  outputSchema: TOutputSchema;
  approval: ToolApproval;
}

/**
 * Helper to define a tool with type inference
 */
export function defineTool<
  TInputSchema extends z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny,
>(
  definition: ToolDefinition<TInputSchema, TOutputSchema>,
): ToolDefinition<TInputSchema, TOutputSchema> {
  return definition;
}
