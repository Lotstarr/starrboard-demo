"use client";

import { useEffect, useRef } from "react";
import { layoutCalendarSpans } from "./layout";

export type DayCalendarEvent = {
  id: string;
  title: string;
  start: number;
  end: number;
  allDay?: boolean;
  free?: boolean;
  local?: boolean;
  href?: string | null;
  timeLabel?: string;
  detail?: string;
};

const hourHeight = 40;

export function DayCalendar({
  dayLabel,
  events,
  nowMinutes,
  zoneLabel = "MT",
  emptyMessage = "No events scheduled today.",
}: {
  dayLabel: string;
  events: DayCalendarEvent[];
  nowMinutes?: number;
  zoneLabel?: string;
  emptyMessage?: string;
}) {
  const scroll = useRef<HTMLDivElement>(null);
  const allDay = events.filter((event) => event.allDay);
  const positioned = layoutCalendarSpans(
    events
      .filter((event) => !event.allDay)
      .map((event) => ({ item: event, start: event.start, end: event.end })),
  );
  useEffect(() => {
    if (!scroll.current) return;
    const firstEvent = positioned[0]?.start ?? nowMinutes ?? 8 * 60;
    const focus =
      nowMinutes === undefined ? firstEvent : Math.min(firstEvent, nowMinutes);
    scroll.current.scrollTop = Math.max(0, ((focus - 60) / 60) * hourHeight);
  }, [nowMinutes, positioned]);
  return (
    <div className="calendar-today">
      <div className="calendar-today-date">
        <span>{zoneLabel}</span>
        <strong>{dayLabel}</strong>
      </div>
      {!!allDay.length && (
        <div className="calendar-today-all-day">
          <span>all-day</span>
          <div>
            {allDay.map((event) => (
              <EventChip event={event} key={event.id} />
            ))}
          </div>
        </div>
      )}
      <div className="calendar-today-scroll" ref={scroll}>
        <div className="calendar-today-grid">
          <div className="calendar-today-hours">
            {Array.from({ length: 24 }, (_, hour) => (
              <span key={hour} style={{ top: hour * hourHeight - 7 }}>
                {hour === 0
                  ? ""
                  : new Date(2000, 0, 1, hour).toLocaleTimeString("en-US", {
                      hour: "numeric",
                    })}
              </span>
            ))}
          </div>
          <div className="calendar-today-column">
            {positioned.map(({ item, start, end, column, columns }) => (
              <EventBlock
                event={item}
                key={item.id}
                style={{
                  top: (start / 60) * hourHeight,
                  height: Math.max(24, ((end - start) / 60) * hourHeight),
                  left: `calc(${(column / columns) * 100}% + 3px)`,
                  width: `calc(${100 / columns}% - 6px)`,
                }}
              />
            ))}
            {nowMinutes !== undefined && (
              <span
                className="calendar-now-line"
                style={{ top: (nowMinutes / 60) * hourHeight }}
              />
            )}
          </div>
        </div>
      </div>
      {!events.length && (
        <p className="small muted calendar-today-empty">{emptyMessage}</p>
      )}
    </div>
  );
}

function EventBlock({
  event,
  style,
}: {
  event: DayCalendarEvent;
  style: React.CSSProperties;
}) {
  const className = `calendar-time-block ${event.local ? "is-local" : ""} ${event.free ? "is-free" : ""}`;
  const content = (
    <>
      <strong>{event.title}</strong>
      <span>{event.timeLabel}</span>
      {event.detail && <span>{event.detail}</span>}
    </>
  );
  return event.href ? (
    <a
      className={className}
      href={event.href}
      target="_blank"
      rel="noreferrer"
      style={style}
      title={event.title}
    >
      {content}
    </a>
  ) : (
    <div className={className} style={style} title={event.title}>
      {content}
    </div>
  );
}

function EventChip({ event }: { event: DayCalendarEvent }) {
  const className = `calendar-all-day-chip ${event.local ? "is-local" : ""}`;
  return event.href ? (
    <a className={className} href={event.href} target="_blank" rel="noreferrer">
      {event.title}
    </a>
  ) : (
    <span className={className}>{event.title}</span>
  );
}
