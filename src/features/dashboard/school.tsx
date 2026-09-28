"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CircleAlert,
  GraduationCap,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { useWorkspace } from "./store";
import { sources } from "./fixtures";
import {
  courses,
  courseResources,
  filterSchoolTasks,
  type DemoTask,
  type SchoolTab,
} from "./model";

export function SourceCards() {
  const { scenario } = useWorkspace();
  return (
    <div className="source-cards">
      {(["byu", "aws"] as const).map((id) => (
        <div className="source-card" key={id}>
          <div className="row-between">
            <h3>{sources[id].name}</h3>
            <span
              className={`badge ${id === "aws" && (scenario === "stale" || scenario === "error") ? "warning" : "success"}`}
            >
              {id === "aws" && scenario === "stale"
                ? "Stale demo"
                : id === "aws" && scenario === "error"
                  ? "Refresh failed"
                  : "Read-only demo"}
            </span>
          </div>
          <p>{sources[id].account}</p>
          <p>
            Last snapshot:{" "}
            {id === "aws" && scenario === "stale"
              ? "Sep 20, 6:02 AM MDT"
              : sources[id].lastSuccess}
          </p>
          <small>
            {id === "byu" ? "IS 401–404" : "IS 404 · separate Canvas instance"}{" "}
            · not connected
          </small>
        </div>
      ))}
      <p className="muted small">
        The eventual refresh cadence is daily plus manual refresh. Books,
        MyEducator, and Xenos are resources; these links do not imply connected
        accounts.
      </p>
    </div>
  );
}

export function SourceFooter() {
  const { scenario } = useWorkspace();
  return (
    <div className="panel-footer source-footer">
      <span>
        <RefreshCw size={12} /> BYU · Sep 21, 6:00 AM
      </span>
      <span
        className={
          scenario === "stale" || scenario === "error" ? "warning" : ""
        }
      >
        AWS ·{" "}
        {scenario === "stale" ? "Sep 20, 6:02 AM · Stale" : "Sep 21, 6:02 AM"}
      </span>
    </div>
  );
}

export function TaskRows({
  tasks,
  compact = false,
}: {
  tasks: DemoTask[];
  compact?: boolean;
}) {
  const { setDrawer } = useWorkspace();
  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <div
          className={`task-row ${task.done ? "task-done" : ""}`}
          key={task.id}
        >
          <span className="task-rank" aria-hidden="true">
            {task.done ? (
              <Check size={16} />
            ) : (
              String(index + 1).padStart(2, "0")
            )}
          </span>
          <div className="task-main">
            <button
              className="task-title"
              onClick={() => setDrawer({ kind: "task", id: task.id })}
            >
              {task.title}
            </button>
            <div className="task-meta">
              {task.course && <span className="badge">{task.course}</span>}
              <span>{sources[task.source].name}</span>
              {!compact && <span>· {task.resource}</span>}
              {task.done && <span className="success">Locally complete</span>}
            </div>
          </div>
          <div
            className={`task-due ${task.attention && !task.done ? "warning" : ""}`}
          >
            {task.due}
            <small>
              {task.estimate === null
                ? "Estimate needed"
                : `${task.estimate} min`}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SchoolState({ children }: { children: React.ReactNode }) {
  const { scenario, refresh, setDrawer } = useWorkspace();
  if (scenario === "loading")
    return (
      <div className="empty-state" role="status" aria-busy="true">
        <RefreshCw size={24} />
        <h3>Loading school commitments</h3>
        <p>Checking separate BYU and AWS demo snapshots.</p>
        <div className="skeleton" />
        <div className="skeleton shorter" />
        <div className="skeleton" />
      </div>
    );
  if (scenario === "empty")
    return (
      <div className="empty-state">
        <BookOpen size={26} />
        <h3>No commitments yet</h3>
        <p>This is the empty-state demo.</p>
        <button
          className="button primary"
          onClick={() => setDrawer({ kind: "capture", area: "school" })}
        >
          Capture assignment
        </button>
        <button className="button quiet" onClick={refresh}>
          Restore demo snapshot
        </button>
      </div>
    );
  return (
    <>
      {(scenario === "error" || scenario === "stale") && (
        <div
          className="notice"
          role={scenario === "error" ? "alert" : "status"}
        >
          {scenario === "error" ? (
            <CircleAlert size={18} />
          ) : (
            <TriangleAlert size={18} />
          )}
          <div>
            <strong>
              {scenario === "error"
                ? "AWS Canvas could not be refreshed"
                : "AWS Canvas is stale"}
            </strong>
            <p>
              Keeping the last demo snapshot. BYU and local planning are
              unchanged.
            </p>
            <button className="text-button" onClick={refresh}>
              {scenario === "error"
                ? "Retry demo refresh"
                : "Refresh demo snapshot"}
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  );
}

export function CourseFilters() {
  const { course, setCourse, tasks, scenario } = useWorkspace();
  return (
    <div className="course-filters">
      <div className="row-between">
        <span className="eyebrow">YOUR COURSES</span>
        <button
          className="text-button"
          onClick={() => setCourse("all")}
          aria-pressed={course === "all"}
        >
          All courses
        </button>
      </div>
      <div className="course-grid">
        {courses.map((id) => (
          <button
            className="course-button"
            aria-pressed={course === id}
            key={id}
            onClick={() => setCourse(id)}
          >
            <span>{id}</span>
            <small>{courseResources[id]}</small>
            <span className="course-count">
              {scenario === "loading"
                ? "—"
                : scenario === "empty"
                  ? 0
                  : tasks.filter((task) => task.course === id && !task.done)
                      .length}{" "}
              open
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SchoolContent({ expanded = false }: { expanded?: boolean }) {
  const { tasks, course, setCourse, schoolTab, setSchoolTab, setDrawer } =
    useWorkspace();
  const filtered = filterSchoolTasks(tasks, course, schoolTab);
  return (
    <>
      {expanded && (
        <div className="school-tabs" aria-label="School views">
          {(
            [
              "All commitments",
              "Assignments",
              "Readings",
              "Sources",
            ] as SchoolTab[]
          ).map((tab) => (
            <button
              key={tab}
              aria-pressed={schoolTab === tab}
              onClick={() => setSchoolTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
      {(course !== "all" || (!expanded && schoolTab !== "All commitments")) && (
        <div className="active-filter">
          <span>
            {course === "all" ? "All courses" : course} · {schoolTab}
          </span>
          <button
            className="text-button"
            onClick={() => {
              setCourse("all");
              setSchoolTab("All commitments");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      <SchoolState>
        {schoolTab === "Sources" ? (
          <SourceCards />
        ) : filtered.length ? (
          <TaskRows
            tasks={expanded ? filtered : filtered.slice(0, 3)}
            compact={!expanded}
          />
        ) : (
          <div className="empty-state">
            <BookOpen size={22} />
            <h3>No matching commitments</h3>
            <p>Try another course or capture a new demo item.</p>
            <button
              className="button"
              onClick={() => setDrawer({ kind: "capture", area: "school" })}
            >
              Capture item
            </button>
          </div>
        )}
      </SchoolState>
    </>
  );
}

export function SchoolWidget({
  expanded,
  onExpand,
  editing,
}: {
  expanded: boolean;
  onExpand: () => void;
  editing: boolean;
}) {
  const { tasks, scenario } = useWorkspace();
  return (
    <>
      <div className="widget-header tone-blue">
        <h2>
          <GraduationCap size={18} />
          School{" "}
          <span className="header-count">
            {scenario === "loading"
              ? "—"
              : scenario === "empty"
                ? 0
                : tasks.filter((task) => task.area === "school" && !task.done)
                    .length}
          </span>
        </h2>
        <div className="actions">
          <button
            className="header-button"
            disabled={editing}
            onClick={onExpand}
          >
            {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{expanded ? "Collapse" : "Expand"}</span>
          </button>
          <Link className="header-button" href="/school">
            Full page <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <div className="widget-body">
        {expanded && <CourseFilters />}
        <SchoolContent expanded={expanded} />
      </div>
      <SourceFooter />
    </>
  );
}

export function SchoolPage() {
  const { setDrawer, refresh, scenario } = useWorkspace();
  return (
    <main id="main" className="dashboard-main" tabIndex={-1}>
      <div className="page-heading">
        <div>
          <p className="eyebrow">WORKSPACE / SCHOOL</p>
          <h1>Your learning, connected.</h1>
          <p>Four courses. Every commitment, with its source intact.</p>
        </div>
        <button
          className="button primary"
          onClick={() => setDrawer({ kind: "capture", area: "school" })}
        >
          <Plus size={16} />
          Capture
        </button>
      </div>
      <CourseFilters />
      <section className="standalone-panel" aria-label="School commitments">
        <div className="widget-header tone-blue">
          <h2>
            <GraduationCap size={18} />
            Commitments
          </h2>
          <button
            className="header-button"
            disabled={scenario === "loading"}
            onClick={refresh}
          >
            <RefreshCw size={15} />
            Refresh Canvas <span className="small">· demo</span>
          </button>
        </div>
        <div className="widget-body">
          <SchoolContent expanded />
        </div>
        <SourceFooter />
      </section>
      <p className="footnote">
        Official source records and personal planning stay separate. All records
        and refreshes on this page are fictional.
      </p>
    </main>
  );
}
