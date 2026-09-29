"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { areas, type AreaId, type DashboardPage, type WidgetId } from "./model";
import { schedule, sources } from "./fixtures";
import { useWorkspace } from "./store";
import { widgetIcons } from "./icons";
import { SchoolState, SchoolWidget } from "./school";
import { WidgetGrid } from "./widget-grid";
import { DayCalendar } from "../calendar/day-view";
import { DemoTaskCheck } from "./task-controls";

function OverviewCard({ id }: { id: AreaId }) {
  const { tasks, setDrawer, scenario } = useWorkspace();
  const area = areas.find((value) => value.id === id)!;
  const Icon = widgetIcons[id];
  const records = tasks.filter((task) => task.area === id);
  const open = records.filter((task) => !task.done);
  const content = (
    <>
      <div className="overview-metric">
        <strong>{open.length}</strong>
        <span>open {area.unit}</span>
        {open.length === 0 && (
          <span className="success small">All caught up</span>
        )}
      </div>
      {(open.length ? open : records).slice(0, 2).map((task) => (
        <div className="overview-row task-overview-row" key={task.id}>
          <DemoTaskCheck task={task} />
          <div>
            <button onClick={() => setDrawer({ kind: "task", id: task.id })}>
              {task.title}
            </button>
            <small className={task.attention ? "warning" : ""}>
              {task.course && `${task.course} · `}
              {task.due}
              {task.done ? " · Locally complete" : ""}
            </small>
          </div>
        </div>
      ))}
    </>
  );
  return (
    <>
      <div className={`widget-header tone-${area.tone}`}>
        <h2>
          <Icon size={18} />
          {area.title}
        </h2>
        <span className="small">
          {id === "school"
            ? "4 courses"
            : id === "work"
              ? "Manual"
              : "This week"}
        </span>
      </div>
      <div className="widget-body overview-body">
        {id === "school" ? <SchoolState>{content}</SchoolState> : content}
      </div>
      <div className="panel-footer">
        <span>
          {id === "school"
            ? scenario === "stale"
              ? "AWS snapshot stale"
              : "BYU + AWS · demo snapshots"
            : id === "work"
              ? "Work account not connected"
              : "Manual · fictional data"}
        </span>
        {id === "school" ? (
          <Link className="text-button" href="/school">
            Open School <ArrowUpRight size={14} />
          </Link>
        ) : (
          <button
            className="text-button"
            onClick={() => setDrawer({ kind: "area", area: id })}
          >
            Review <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </>
  );
}

export function ScheduleCard() {
  const { setDrawer } = useWorkspace();
  return (
    <>
      <div className="widget-header tone-mint">
        <h2>
          <CalendarDays size={18} />
          Your day
        </h2>
        <span className="small">MDT · demo</span>
      </div>
      <div className="widget-body">
        <DayCalendar
          dayLabel="Monday, September 21"
          events={schedule.map((event) => ({
            ...event,
            id: `${event.start}:${event.title}`,
            timeLabel: new Date(2000, 0, 1, 0, event.start).toLocaleTimeString(
              "en-US",
              { hour: "numeric", minute: "2-digit" },
            ),
          }))}
          zoneLabel="MT"
        />
        <p className="schedule-caveat">
          Work calendar not connected. Availability may be incomplete.
        </p>
      </div>
      <div className="panel-footer">
        <button
          className="text-button"
          onClick={() => setDrawer({ kind: "ai" })}
        >
          Plan available time <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}

function Recommendation() {
  const { setDrawer } = useWorkspace();
  return (
    <div className="recommendation">
      <div className="recommendation-icon">
        <Sparkles size={22} />
      </div>
      <div>
        <p className="eyebrow">A LITTLE CLARITY</p>
        <h2>Start with the deadline. Leave room to think.</h2>
        <p>
          The equipment model is due tonight. A 75-minute focus block fits the
          demo calendar before your project check-in.
        </p>
        <span className="small muted">
          Prepared example · no AI service connected
        </span>
      </div>
      <button className="button" onClick={() => setDrawer({ kind: "ai" })}>
        Review plan <ArrowRight size={15} />
      </button>
    </div>
  );
}

export function Dashboard({ page }: { page: DashboardPage }) {
  const [expanded, setExpanded] = useState(false);
  const { tasks, approval, setDrawer, scenario } = useWorkspace();
  const due = tasks.filter(
    (task) => task.attention === "Due today" && !task.done,
  ).length;
  function render(id: WidgetId, editing: boolean) {
    if (id === "schedule") return <ScheduleCard />;
    if (id === "recommendation") return <Recommendation />;
    if (page === "today" && id === "school")
      return (
        <SchoolWidget
          expanded={expanded}
          onExpand={() => setExpanded(!expanded)}
          editing={editing}
        />
      );
    if (
      id !== "school" &&
      id !== "ta" &&
      id !== "work" &&
      id !== "career" &&
      id !== "projects"
    )
      return null;
    return <OverviewCard id={id} />;
  }
  return (
    <main id="main" className="dashboard-main" tabIndex={-1}>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            {page === "home"
              ? "HOME / ALL AREAS"
              : "MONDAY, SEPTEMBER 21 · DEMO DAY"}
          </p>
          <h1>
            {page === "home"
              ? "Everything, in view."
              : "Make room for what matters."}
          </h1>
          <p>
            {page === "home"
              ? "A little perspective. A clear next step."
              : "Your commitments, your time, and a plan you can adjust."}
          </p>
        </div>
        {page === "home" ? (
          <Link className="button" href="/today">
            <Clock3 size={16} />
            Focus on today <ArrowRight size={16} />
          </Link>
        ) : (
          <button
            className="button primary"
            onClick={() => setDrawer({ kind: "ai" })}
          >
            <Sparkles size={16} />
            Plan today
          </button>
        )}
      </div>
      <div className="attention-bar">
        <span>
          <TriangleAlert size={16} />
          {scenario === "loading"
            ? "Checking demo deadlines…"
            : scenario === "empty"
              ? "No commitments in this demo state"
              : due
                ? `${due} school deadline today`
                : "No remaining deadlines today"}
        </span>
        <span className="attention-divider" aria-hidden="true" />
        <button onClick={() => setDrawer({ kind: "approval" })}>
          {approval === "pending"
            ? "1 prepared action needs your review"
            : `Demo action ${approval}`}
          <ArrowRight size={14} />
        </button>
        <span className="attention-scope">School + personal scope</span>
      </div>
      <WidgetGrid
        page={page}
        expanded={expanded}
        onExpand={setExpanded}
        render={render}
      />
      <div className="canvas-note">
        <span>
          <span className="status-dot" />
          Your space, at a glance
        </span>
        <span>
          {page === "home"
            ? "Open a workspace for the details."
            : `Source accounts stay separate · ${sources.byu.account}`}
        </span>
      </div>
    </main>
  );
}
