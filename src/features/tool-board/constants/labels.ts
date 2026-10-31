export const TOOL_CATEGORY_LABELS = {
  power_tools: "Power tools",
  garden: "Garden",
  kitchen: "Kitchen",
  camping: "Camping",
  other: "Other",
} as const;

export const TOOL_CONDITION_LABELS = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  needs_care: "Needs care",
} as const;

export type ToolCategoryKey = keyof typeof TOOL_CATEGORY_LABELS;
export type ToolConditionKey = keyof typeof TOOL_CONDITION_LABELS;

export const TOOL_CATEGORY_OPTIONS = Object.entries(TOOL_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as ToolCategoryKey, label }),
);

export const TOOL_CONDITION_OPTIONS = Object.entries(TOOL_CONDITION_LABELS).map(
  ([value, label]) => ({ value: value as ToolConditionKey, label }),
);
