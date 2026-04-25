import type { z } from "zod";
// =============================================================================
// Tool Definition
// =============================================================================

export interface ToolDefinition<
  TInput extends z.ZodType = z.ZodType,
  TOutput extends z.ZodType = z.ZodType,
> {
  name: string;
  description: string;
  inputSchema: TInput;
  outputSchema?: TOutput;
}

export function defineTool<TInput extends z.ZodType, TOutput extends z.ZodType>(
  definition: ToolDefinition<TInput, TOutput>,
): ToolDefinition<TInput, TOutput> {
  return definition;
}

// =============================================================================
// Agent Definition
// =============================================================================

export interface AgentDefinition<
  TInput extends z.ZodType = z.ZodType,
  TOutput extends z.ZodType = z.ZodType,
> {
  name: string;
  description: string;
  instructions: string;
  inputSchema: TInput;
  outputSchema?: TOutput;
}

export function defineAgent<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
>(
  definition: AgentDefinition<TInput, TOutput>,
): AgentDefinition<TInput, TOutput> {
  return definition;
}

// =============================================================================
// Type Inference Helpers
// =============================================================================

export type InferToolInput<T> =
  T extends ToolDefinition<infer I, any> ? z.infer<I> : never;

export type InferToolOutput<T> =
  T extends ToolDefinition<any, infer O> ? z.infer<O> : never;

export type InferAgentInput<T> =
  T extends AgentDefinition<infer I, any> ? z.infer<I> : never;

export type InferAgentOutput<T> =
  T extends AgentDefinition<any, infer O> ? z.infer<O> : never;
