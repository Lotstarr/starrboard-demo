import type { DashboardPage, WidgetId, WidgetLayout } from "./model.ts";

export const defaultLayouts: Record<DashboardPage, WidgetLayout[]> = {
  automations: [
    { id: "automation-rules", columns: 5, height: 660 },
    { id: "automation-review", columns: 7, height: 660 },
    { id: "automation-history", columns: 12, height: 400 },
  ],
  projects: [
    { id: "portfolio-summary", columns: 12, height: 200 },
    { id: "portfolio-board", columns: 8, height: 540 },
    { id: "portfolio-milestones", columns: 4, height: 540 },
    { id: "portfolio-github", columns: 8, height: 360 },
    { id: "portfolio-existing", columns: 4, height: 360 },
  ],
  career: [
    { id: "career-summary", columns: 12, height: 200 },
    { id: "career-pipeline", columns: 8, height: 560 },
    { id: "career-dates", columns: 4, height: 560 },
    { id: "career-preparation", columns: 8, height: 360 },
    { id: "career-resources", columns: 4, height: 360 },
  ],
  ta: [
    { id: "ta-progress", columns: 12, height: 280 },
    { id: "ta-duties", columns: 8, height: 520 },
    { id: "ta-agenda", columns: 4, height: 520 },
    { id: "ta-followups", columns: 8, height: 360 },
    { id: "ta-resources", columns: 4, height: 360 },
  ],
  home: ["school", "ta", "career", "projects", "schedule"].map((id) => ({
    id: id as WidgetId,
    columns: 4,
    height: 280,
  })),
  school: [
    { id: "school-progress", columns: 12, height: 200 },
    { id: "school-coursework", columns: 8, height: 580 },
    { id: "school-todo", columns: 4, height: 580 },
    { id: "school-readings", columns: 8, height: 400 },
    { id: "school-week", columns: 4, height: 400 },
  ],
  today: [
    { id: "school", columns: 8, height: 400 },
    { id: "schedule", columns: 4, height: 400 },
    { id: "recommendation", columns: 12, height: 160 },
  ],
};

export function moveWidget(
  layout: WidgetLayout[],
  id: WidgetId,
  toIndex: number,
): WidgetLayout[] {
  const fromIndex = layout.findIndex((item) => item.id === id);
  if (fromIndex < 0 || toIndex < 0 || toIndex >= layout.length) return layout;
  const result = [...layout];
  const [item] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, item);
  return result;
}

export function resizeWidget(
  layout: WidgetLayout[],
  id: WidgetId,
  columns: number,
  height: number,
): WidgetLayout[] {
  if (!Number.isFinite(columns) || !Number.isFinite(height)) return layout;
  return layout.map((item) =>
    item.id === id
      ? {
          ...item,
          columns: Math.max(4, Math.min(12, Math.round(columns))),
          height: Math.max(
            id === "recommendation"
              ? 160
              : id === "school-progress" ||
                  id === "career-summary" ||
                  id === "portfolio-summary"
                ? 180
                : 280,
            Math.min(800, Math.round(height / 20) * 20),
          ),
        }
      : item,
  );
}

/** Reject partial, duplicated, unknown, or malformed persisted layouts. */
export function parseLayout(
  raw: string | null,
  page: DashboardPage,
): WidgetLayout[] {
  const fallback = defaultLayouts[page];
  if (!raw) return fallback;
  try {
    let value: unknown = JSON.parse(raw);
    // Keep the order and sizes of older Home layouts while work is deferred.
    if (page === "home" && Array.isArray(value))
      value = value.filter((item) => item?.id !== "work");
    if (!Array.isArray(value) || value.length !== fallback.length)
      return fallback;
    const seen = new Set<string>();
    for (const item of value) {
      if (
        !item ||
        typeof item !== "object" ||
        !fallback.some((widget) => widget.id === item.id) ||
        seen.has(item.id) ||
        !Number.isInteger(item.columns) ||
        item.columns < 4 ||
        item.columns > 12 ||
        !Number.isInteger(item.height) ||
        item.height <
          (item.id === "recommendation"
            ? 160
            : item.id === "school-progress" ||
                item.id === "career-summary" ||
                item.id === "portfolio-summary"
              ? 180
              : 280) ||
        item.height > 800
      )
        return fallback;
      seen.add(item.id);
    }
    return value.map(({ id, columns, height }) => ({ id, columns, height }));
  } catch {
    return fallback;
  }
}
