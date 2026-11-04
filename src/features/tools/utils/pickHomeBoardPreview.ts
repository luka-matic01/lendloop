import { HOME_BOARD_PREVIEW_LIMIT } from "../constants/copy";
import {
  TOOL_CATEGORY_LABELS,
  type ToolCategoryKey,
} from "../constants/labels";

const CATEGORY_ORDER = Object.keys(
  TOOL_CATEGORY_LABELS,
) as ToolCategoryKey[];

function publicToolKey(tool: { name: string; category: ToolCategoryKey }) {
  return `${tool.category}\0${tool.name}`;
}

/** Up to `limit` tools: try one per category first, then fill from the rest. */
export function pickHomeBoardPreview<
  T extends { name: string; category: ToolCategoryKey },
>(tools: T[], limit = HOME_BOARD_PREVIEW_LIMIT): T[] {
  if (tools.length <= limit) {
    return tools;
  }

  const byCategory = new Map<ToolCategoryKey, T[]>();
  for (const tool of tools) {
    const bucket = byCategory.get(tool.category) ?? [];
    bucket.push(tool);
    byCategory.set(tool.category, bucket);
  }

  const picked: T[] = [];
  const seen = new Set<string>();

  const take = (tool: T) => {
    const key = publicToolKey(tool);
    if (seen.has(key) || picked.length >= limit) {
      return;
    }
    seen.add(key);
    picked.push(tool);
  };

  for (const category of CATEGORY_ORDER) {
    const first = byCategory.get(category)?.[0];
    if (first) {
      take(first);
    }
  }

  for (const tool of tools) {
    take(tool);
  }

  return picked;
}
