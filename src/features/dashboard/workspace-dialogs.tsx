"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CircleAlert,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { Dialog } from "./dialog";
import { useWorkspace } from "./store";
import {
  areas,
  calendarConflict,
  courses,
  searchTasks,
  type AreaId,
  type Course,
  type DemoTask,
  type Scenario,
} from "./model";
import { sources } from "./fixtures";
import { SourceCards } from "./school";
import { Navigation } from "./shell";
import { DemoTaskCheck } from "./task-controls";

function TaskDetail({ task }: { task: DemoTask }) {
  const { updateTask, announce, scenario } = useWorkspace();
  const source = sources[task.source];
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const estimate = String(fields.get("estimate") ?? "");
    updateTask(task.id, {
      notes: String(fields.get("notes") ?? "").trim(),
      estimate: estimate ? Number(estimate) : null,
    });
    announce(
      "Personal planning saved for this demo session. Official source fields were not changed.",
    );
  }
  return (
    <>
      <span className="badge">
        {task.course ?? areas.find((area) => area.id === task.area)?.title}
      </span>
      <h3 className="detail-title">{task.title}</h3>
      <section className="detail-section">
        <p className="eyebrow">
          {task.source === "manual"
            ? "MANUALLY CAPTURED DETAILS"
            : "OFFICIAL SOURCE · FICTIONAL SNAPSHOT"}
        </p>
        <dl>
          <dt>Provider</dt>
          <dd>{source.name}</dd>
          <dt>Account</dt>
          <dd>{source.account}</dd>
          <dt>Due</dt>
          <dd>{task.due}</dd>
          <dt>Resource</dt>
          <dd>{task.resource}</dd>
          <dt>Access</dt>
          <dd>{source.capability}</dd>
          <dt>Source ID</dt>
          <dd>
            {task.source === "manual"
              ? "Local demo record"
              : `demo-${task.source}-${task.id}`}
          </dd>
          <dt>Last success</dt>
          <dd>
            {task.source === "aws" && scenario === "stale"
              ? "Sep 20, 6:02 AM MDT · stale"
              : source.lastSuccess}
          </dd>
          <dt>Submission</dt>
          <dd>
            {task.source === "manual"
              ? "Not applicable"
              : "Not submitted in demo snapshot"}
          </dd>
          <dt>Original link</dt>
          <dd>No live assignment URL in this fictional demo.</dd>
        </dl>
      </section>
      <section className="detail-section">
        <p className="eyebrow">YOUR PERSONAL PLANNING</p>
        <label className="check-row">
          <input
            type="checkbox"
            checked={task.done}
            onChange={(event) => {
              updateTask(task.id, { done: event.target.checked });
              announce(
                event.target.checked
                  ? "Marked locally complete. Source submission status is unchanged."
                  : "Local completion cleared.",
              );
            }}
          />
          <span>
            Mark locally complete
            <small>This never submits an assignment.</small>
          </span>
        </label>
        <form onSubmit={save}>
          <label className="field">
            Estimate (minutes)
            <input
              name="estimate"
              type="number"
              min="1"
              max="1440"
              defaultValue={task.estimate ?? ""}
              placeholder="Not estimated"
            />
          </label>
          <label className="field">
            Personal notes
            <textarea
              name="notes"
              rows={4}
              maxLength={2000}
              defaultValue={task.notes}
              placeholder="Add a fictional planning note…"
            />
          </label>
          <button className="button primary" type="submit">
            Save planning
          </button>
        </form>
        <p className="footnote">
          Demo changes last until the app is refreshed.
        </p>
      </section>
    </>
  );
}

function AreaDetail({ id }: { id: AreaId }) {
  const { tasks, setDrawer } = useWorkspace();
  const area = areas.find((value) => value.id === id)!;
  return (
    <>
      <p className="muted">{area.subtitle}</p>
      {id === "work" && (
        <div className="notice">
          <CircleAlert size={17} />
          <p>
            Fictional manual commitments. The employer account is not connected.
          </p>
        </div>
      )}
      <div className="area-list">
        {tasks
          .filter((task) => task.area === id)
          .map((task) => (
            <div className="area-task" key={task.id}>
              <DemoTaskCheck task={task} />
              <div>
                <button
                  className={`task-title ${task.done ? "completed-title" : ""}`}
                  onClick={() => setDrawer({ kind: "task", id: task.id })}
                >
                  {task.title}
                </button>
                <p className="small muted">{task.due}</p>
              </div>
            </div>
          ))}
      </div>
      <button
        className="button primary"
        onClick={() => setDrawer({ kind: "capture", area: id })}
      >
        <Plus size={16} />
        Capture for {area.title}
      </button>
      {id === "school" && (
        <Link
          className="button spaced-link"
          href="/school"
          onClick={() => setDrawer(null)}
        >
          Open School workspace <ArrowRight size={15} />
        </Link>
      )}
      <p className="footnote">
        Fictional tasks are editable for this session. This sample shows a
        subset of the private application’s workspaces.
      </p>
    </>
  );
}

function Capture({ initialArea }: { initialArea: AreaId }) {
  const { capture, course } = useWorkspace();
  const [area, setArea] = useState<AreaId>(initialArea);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const title = String(fields.get("title") ?? "").trim();
    if (title.length < 3) {
      setError("Add a title with at least three characters.");
      return;
    }
    const date = String(fields.get("due") ?? "");
    const estimate = String(fields.get("estimate") ?? "");
    capture({
      title,
      area,
      course: area === "school" ? (fields.get("course") as Course) : undefined,
      resource:
        String(fields.get("resource") ?? "").trim() || "Manual planning",
      due: date
        ? `Planned due · ${new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00Z`))}`
        : "No verified deadline",
      estimate: estimate ? Number(estimate) : null,
      kind:
        area === "school" ? (fields.get("kind") as DemoTask["kind"]) : "Task",
    });
  }
  return (
    <>
      <p className="muted">
        Capture a fictional task. It stays in this demo session.
      </p>
      <form onSubmit={submit}>
        <label className="field">
          Area
          <select
            value={area}
            onChange={(event) => setArea(event.target.value as AreaId)}
          >
            {areas
              .filter((item) => item.id !== "work")
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
          </select>
        </label>
        <label className="field">
          Title
          <input
            name="title"
            required
            minLength={3}
            maxLength={160}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "capture-error" : undefined}
            placeholder="What needs to happen?"
            onChange={() => setError("")}
          />
        </label>
        {area === "school" && (
          <div className="form-columns">
            <label className="field">
              Course
              <select
                name="course"
                defaultValue={course === "all" ? "IS 401" : course}
              >
                {courses.map((id) => (
                  <option key={id}>{id}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Type
              <select name="kind">
                <option>Assignment</option>
                <option>Reading</option>
              </select>
            </label>
          </div>
        )}
        <label className="field">
          Resource / context
          <input
            name="resource"
            maxLength={180}
            placeholder="Book chapter, instructions, or project"
          />
        </label>
        <div className="form-columns">
          <label className="field">
            Due date (optional)
            <input name="due" type="date" min="2020-01-01" max="2100-12-31" />
          </label>
          <label className="field">
            Estimate (minutes)
            <input
              name="estimate"
              type="number"
              min="1"
              max="1440"
              placeholder="Not estimated"
            />
          </label>
        </div>
        {error && (
          <p className="danger" id="capture-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button primary">
          <Plus size={16} />
          Capture demo task
        </button>
      </form>
    </>
  );
}

function CommandSearch() {
  const [query, setQuery] = useState("");
  const { tasks, setDrawer } = useWorkspace();
  const router = useRouter();
  const results = searchTasks(tasks, query);
  const pages = [
    { title: "Home overview", path: "/" },
    { title: "Today’s plan", path: "/today" },
    { title: "School workspace", path: "/school" },
  ].filter(
    (item) =>
      !query.trim() ||
      item.title.toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <>
      <label className="field search-field">
        <span>Search tasks, courses, and resources</span>
        <div className="search-input">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try AWS, IS 403, or Scrum"
          />
        </div>
      </label>
      <p className="small muted" role="status">
        {query.trim()
          ? `${results.length} tasks · ${pages.length} destinations`
          : "Jump to a view or search the fictional tasks."}
      </p>
      <div className="command-results">
        {pages.map((page) => (
          <button
            key={page.path}
            onClick={() => {
              router.push(page.path);
              setDrawer(null);
            }}
          >
            <span>{page.title}</span>
            <ArrowRight size={15} />
          </button>
        ))}
        {results.map((task) => (
          <button
            key={task.id}
            onClick={() => setDrawer({ kind: "task", id: task.id })}
          >
            <span>
              {task.title}
              <small>
                {task.course ??
                  areas.find((area) => area.id === task.area)?.title}{" "}
                · {sources[task.source].name}
              </small>
            </span>
            <ArrowRight size={15} />
          </button>
        ))}
      </div>
      {query.trim() && !results.length && !pages.length && (
        <div className="empty-state">
          <h3>No matching demo items</h3>
          <p>Try a course, source, or a shorter phrase.</p>
        </div>
      )}
      <button
        className="button spaced-link"
        onClick={() => setDrawer({ kind: "capture", area: "school" })}
      >
        <Plus size={16} />
        Capture a task
      </button>
    </>
  );
}

function AiPlan() {
  const { setDrawer } = useWorkspace();
  const [answer, setAnswer] = useState("");
  return (
    <>
      <span className="badge violet">
        <Sparkles size={13} />
        Prepared demo · no AI connected
      </span>
      <h3 className="detail-title">A realistic place to start.</h3>
      <p className="muted">
        The equipment model is due tonight and has a 75-minute estimate. Start
        there, then leave a buffer before the afternoon check-in.
      </p>
      <div className="proposal">
        <p className="eyebrow">SUGGESTED FOCUS</p>
        <h3>13:00–14:15 · Equipment model</h3>
        <p>
          Fits the 13:00–15:00 opening in the fictional school and personal
          calendars.
        </p>
        <p>Keep the next 45 minutes free for a break or an overrun.</p>
      </div>
      <div className="notice">
        <CircleAlert size={17} />
        <p>
          Work calendar unavailable. The PDF reading has no estimate or verified
          deadline. Review those gaps before trusting a full plan.
        </p>
      </div>
      <button
        className="button primary"
        onClick={() => setDrawer({ kind: "approval" })}
      >
        Review prepared action <ArrowRight size={16} />
      </button>
      <form
        className="detail-section"
        onSubmit={(event) => {
          event.preventDefault();
          setAnswer(
            "This fixed demo puts the nearest deadline first and checks a 75-minute block against three fictional events. It cannot answer general questions or access your accounts yet.",
          );
        }}
      >
        <label className="field">
          Ask about this example
          <input
            name="question"
            required
            maxLength={300}
            placeholder="Why start with this assignment?"
          />
        </label>
        <button className="button" type="submit">
          Explain demo plan
        </button>
      </form>
      {answer && (
        <p className="proposal" role="status">
          {answer}
        </p>
      )}
    </>
  );
}

function Approval() {
  const { approval, setApproval, proposedTime, setProposedTime, announce } =
    useWorkspace();
  const conflict = calendarConflict(proposedTime);
  return (
    <>
      <span className="badge">Calendar action · simulation only</span>
      <h3 className="detail-title">Create a focus block</h3>
      <dl className="approval-fields">
        <dt>Title</dt>
        <dd>Equipment model · focus time</dd>
        <dt>Account</dt>
        <dd>learner@example.edu</dd>
        <dt>Calendar</dt>
        <dd>School · fictional</dd>
        <dt>Date</dt>
        <dd>September 21, 2026</dd>
        <dt>Timezone</dt>
        <dd>America/Denver · MDT</dd>
        <dt>Duration</dt>
        <dd>75 minutes</dd>
        <dt>Source</dt>
        <dd>IS 402 · BYU Canvas · demo-byu-equipment</dd>
      </dl>
      {approval === "pending" ? (
        <>
          <label className="field">
            Start time
            <input
              type="time"
              value={proposedTime}
              required
              onChange={(event) => setProposedTime(event.target.value)}
            />
          </label>
          {conflict ? (
            <div className="notice" role="alert">
              <CircleAlert size={17} />
              <div>
                <strong>Resolve the time conflict</strong>
                <p>
                  The block overlaps a demo event or uses an invalid time. At
                  15:00, it overlaps the 16:00 project check-in.
                </p>
                <button
                  className="text-button"
                  onClick={() => setProposedTime("13:00")}
                >
                  Use available time · 13:00
                </button>
              </div>
            </div>
          ) : (
            <div className="notice success">
              <Check size={17} />
              <p>
                No conflict in the selected demo calendars. Work availability is
                still unknown.
              </p>
            </div>
          )}
          <div className="actions">
            <button
              className="button primary"
              disabled={conflict}
              onClick={() => {
                if (calendarConflict(proposedTime)) return;
                setApproval("approved");
                announce(
                  "Demo approval recorded. No calendar event was created.",
                );
              }}
            >
              Approve demo action
            </button>
            <button
              className="button"
              onClick={() => {
                setApproval("rejected");
                announce("Demo action rejected. Nothing was sent.");
              }}
            >
              Reject
            </button>
          </div>
        </>
      ) : (
        <div className="proposal" role="status">
          <h3>
            {approval === "approved"
              ? "Approved in this demo"
              : "Demo action rejected"}
          </h3>
          <p>No calendar event was created. No account was contacted.</p>
          <button
            className="text-button"
            onClick={() => {
              setApproval("pending");
              setProposedTime("15:00");
            }}
          >
            Reset approval example
          </button>
        </div>
      )}
      <p className="footnote">
        Real execution, audit history, and conflict revalidation belong to later
        phases.
      </p>
    </>
  );
}

function Settings() {
  const { scenario, setScenario } = useWorkspace();
  return (
    <>
      <p className="muted">
        Explore the interface without connecting an account.
      </p>
      <label className="field">
        School demo state
        <select
          value={scenario}
          onChange={(event) => setScenario(event.target.value as Scenario)}
        >
          <option value="ready">Loaded</option>
          <option value="loading">Loading</option>
          <option value="empty">Empty</option>
          <option value="error">Refresh error · cached data</option>
          <option value="stale">AWS stale · cached data</option>
        </select>
      </label>
      <div className="proposal">
        <h3>Local preferences</h3>
        <p>
          Sidebar collapse and saved Home/Today layouts stay in this browser.
          Task edits, captures, notes, and approvals reset when you refresh the
          app.
        </p>
      </div>
      <div className="proposal">
        <h3>Your visual baseline</h3>
        <p>
          Midnight blue, light feature headers, and clear text. Colors and
          layout can evolve with your feedback.
        </p>
      </div>
      <SourceCards />
    </>
  );
}

export function WorkspaceDialogs() {
  const { drawer, setDrawer, tasks } = useWorkspace();
  if (!drawer) return null;
  const close = () => setDrawer(null);
  let title = "";
  let content: React.ReactNode;
  switch (drawer.kind) {
    case "task": {
      const task = tasks.find((value) => value.id === drawer.id);
      if (!task) return null;
      title = "Commitment details";
      content = <TaskDetail key={task.id} task={task} />;
      break;
    }
    case "area":
      title = areas.find((value) => value.id === drawer.area)!.title;
      content = <AreaDetail id={drawer.area} />;
      break;
    case "capture":
      title = "Quick capture";
      content = <Capture initialArea={drawer.area} />;
      break;
    case "search":
      title = "Search & commands";
      content = <CommandSearch />;
      break;
    case "sources":
      title = "Source health";
      content = (
        <>
          <p className="muted">
            Separate identities. Fictional snapshots only.
          </p>
          <SourceCards />
        </>
      );
      break;
    case "settings":
      title = "Demo settings";
      content = <Settings />;
      break;
    case "ai":
      title = "AI Manager";
      content = <AiPlan />;
      break;
    case "approval":
      title = "Review prepared action";
      content = <Approval />;
      break;
    case "navigation":
      title = "Command center";
      content = <Navigation close={close} />;
      break;
    case "automations":
      title = "Automations";
      content = (
        <div className="empty-state">
          <Sparkles size={26} />
          <h3>No automations are running</h3>
          <p>
            Rules, histories, and provider actions will be introduced in later
            approved phases.
          </p>
          <button
            className="button"
            onClick={() => setDrawer({ kind: "approval" })}
          >
            Explore the approval example
          </button>
        </div>
      );
      break;
  }
  return (
    <Dialog
      key={drawer.kind}
      title={title}
      close={close}
      variant={
        drawer.kind === "search"
          ? "command-dialog"
          : drawer.kind === "navigation"
            ? "navigation-dialog"
            : "drawer"
      }
    >
      {content}
    </Dialog>
  );
}
