export type CalendarSpan<T> = {
  item: T;
  start: number;
  end: number;
};

export type PositionedCalendarSpan<T> = CalendarSpan<T> & {
  column: number;
  columns: number;
};

export function layoutCalendarSpans<T>(
  spans: CalendarSpan<T>[],
): PositionedCalendarSpan<T>[] {
  const sorted = spans
    .filter((span) => span.end > span.start)
    .map((span, order) => ({ ...span, order }))
    .sort(
      (a, b) =>
        a.start - b.start ||
        b.end - b.start - (a.end - a.start) ||
        a.order - b.order,
    );
  const positioned: PositionedCalendarSpan<T>[] = [];
  let group: typeof sorted = [];
  let groupEnd = -Infinity;
  const placeGroup = () => {
    const columnEnds: number[] = [];
    const placed = group.map((span) => {
      let column = columnEnds.findIndex((end) => end <= span.start);
      if (column === -1) column = columnEnds.length;
      columnEnds[column] = span.end;
      return { ...span, column };
    });
    const columns = columnEnds.length;
    positioned.push(
      ...placed.map((span) => ({
        item: span.item,
        start: span.start,
        end: span.end,
        column: span.column,
        columns,
      })),
    );
  };
  for (const span of sorted) {
    if (group.length && span.start >= groupEnd) {
      placeGroup();
      group = [];
      groupEnd = -Infinity;
    }
    group.push(span);
    groupEnd = Math.max(groupEnd, span.end);
  }
  if (group.length) placeGroup();
  return positioned;
}
