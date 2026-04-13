import type { ToolDefinition } from "@assistant-ui/react";
import { toolDefinitionRegistry, type ToolName } from "@weekly-cal/core";
import {
  renderGetMealEntriesByDate,
  renderGetMealEntriesByWeek,
  renderModifyEntity,
  renderPreviewMeal,
} from "./tool-renders";

// =============================================================================
// Centralized Toolkit using the recommended Tools() API
// All tools are defined in one place and registered via useAui({ tools: Tools({ toolkit }) })
// =============================================================================

export const toolkit: { [key in ToolName]?: ToolDefinition<any, any> } = {
  preview_meal: {
    type: "human" as const,
    description: toolDefinitionRegistry.preview_meal.description,
    parameters: toolDefinitionRegistry.preview_meal.inputSchema,
    render: renderPreviewMeal,
  },
  modify_entity: {
    type: "human" as const,
    description: toolDefinitionRegistry.modify_entity.description,
    parameters: toolDefinitionRegistry.modify_entity.inputSchema,
    render: renderModifyEntity,
  },
  get_meal_entries_by_date: {
    type: "backend",
    render: renderGetMealEntriesByDate,
  },
  get_meal_entries_by_week: {
    type: "backend",
    render: renderGetMealEntriesByWeek,
  },
};
