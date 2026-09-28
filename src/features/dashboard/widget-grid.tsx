"use client";

import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsLeftRight,
  GripVertical,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  defaultLayouts,
  moveWidget,
  parseLayout,
  resizeWidget,
} from "./layout-model";
import { usePreference } from "./preferences";
import { useWorkspace } from "./store";
import {
  areas,
  type DashboardPage,
  type WidgetId,
  type WidgetLayout,
} from "./model";

const schoolTitles: Partial<Record<WidgetId, string>> = {
  "automation-rules": "Rules & permissions",
  "automation-review": "Latest school review",
  "automation-history": "Run history & reviews",
  "portfolio-summary": "Portfolio readiness",
  "portfolio-board": "Projects to showcase",
  "portfolio-milestones": "Next milestones",
  "portfolio-github": "GitHub activity",
  "portfolio-existing": "Existing workspace projects",
  "career-summary": "Career at a glance",
  "career-pipeline": "Application pipeline",
  "career-dates": "Deadlines & follow-ups",
  "career-preparation": "Preparation checklist",
  "career-resources": "Career resources",
  "ta-progress": "TA week at a glance",
  "ta-duties": "TA checklist",
  "ta-agenda": "Classes, office hours & meetings",
  "ta-followups": "Message follow-ups",
  "ta-resources": "TA resources",
  "school-progress": "Weekly progress",
  "school-coursework": "Coursework",
  "school-todo": "To-do list",
  "school-readings": "Reading plan",
  "school-week": "Week at a glance",
};
const titleOf = (id: WidgetId) =>
  schoolTitles[id] ??
  areas.find((area) => area.id === id)?.title ??
  (id === "schedule" ? "Schedule" : "Recommendation");
type Gesture = {
  id: WidgetId;
  kind: "move" | "resize";
  x: number;
  y: number;
  step: number;
  columns: number;
  height: number;
  before: WidgetLayout[];
  target: WidgetId | null;
  pointerId: number;
  element: HTMLElement;
};

type GridProps = {
  page: DashboardPage;
  expanded: boolean;
  onExpand: (value: boolean) => void;
  render: (id: WidgetId, editing: boolean) => ReactNode;
};

export function WidgetGrid(props: GridProps) {
  const [raw, save] = usePreference(`layout-${props.page}`);
  const { announce } = useWorkspace();
  return (
    <LayoutCanvas
      {...props}
      raw={raw}
      version={0}
      announce={announce}
      save={async (value) => {
        const persisted = save(value);
        return {
          ok: true,
          sessionOnly: !persisted,
          message: persisted
            ? "Layout saved in this browser."
            : "Layout kept for this visit only; browser storage is unavailable.",
        };
      }}
    />
  );
}

export function LayoutCanvas({
  page,
  expanded,
  onExpand,
  render,
  raw,
  version,
  save,
  announce,
}: GridProps & {
  raw: string | null;
  version: number;
  save: (
    value: string,
    version: number,
  ) => Promise<{ ok: boolean; message: string; sessionOnly?: boolean }>;
  announce: (message: string) => void;
}) {
  const stored = useMemo(() => parseLayout(raw, page), [raw, page]);
  const [sessionLayout, setSessionLayout] = useState<WidgetLayout[] | null>(
    null,
  );
  const [draft, setDraft] = useState<WidgetLayout[] | null>(null);
  const [dragTarget, setDragTarget] = useState<WidgetId | null>(null);
  const [dragging, setDragging] = useState<WidgetId | null>(null);
  const [message, setMessage] = useState("");
  const grid = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const editVersion = useRef(version);
  const [saving, setSaving] = useState(false);
  const layout = draft ?? sessionLayout ?? stored;
  const editing = draft !== null;

  function move(id: WidgetId, to: number) {
    setDraft((current) => (current ? moveWidget(current, id, to) : current));
    setMessage(`${titleOf(id)} moved to position ${to + 1}.`);
  }
  function resize(id: WidgetId, columns: number, height: number) {
    setDraft((current) =>
      current ? resizeWidget(current, id, columns, height) : current,
    );
    setMessage(`${titleOf(id)} size updated.`);
  }
  function start(
    event: ReactPointerEvent<HTMLButtonElement>,
    item: WidgetLayout,
    kind: Gesture["kind"],
  ) {
    if (!draft || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    const width = grid.current!.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(grid.current!).columnGap);
    const height = event.currentTarget
      .closest(".widget")!
      .getBoundingClientRect().height;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      id: item.id,
      kind,
      x: event.clientX,
      y: event.clientY,
      step: (width + gap) / 12,
      columns: item.columns,
      height: Math.max(item.height, height),
      before: draft,
      target: null,
      pointerId: event.pointerId,
      element: event.currentTarget,
    };
    setDragging(item.id);
    setMessage(
      kind === "move"
        ? `Moving ${titleOf(item.id)}. Drop over another card.`
        : `Resizing ${titleOf(item.id)}. Escape cancels this gesture.`,
    );
  }
  function pointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (active.kind === "resize") {
      const columns =
        active.columns + Math.round((event.clientX - active.x) / active.step);
      const height = active.height + event.clientY - active.y;
      setDraft(resizeWidget(active.before, active.id, columns, height));
    } else {
      const target = document
        .elementsFromPoint(event.clientX, event.clientY)
        .map((element) => element.closest<HTMLElement>("[data-widget]"))
        .find((element) => element && element.dataset.widget !== active.id);
      active.target = (target?.dataset.widget as WidgetId | undefined) ?? null;
      setDragTarget(active.target);
    }
  }
  function finish(cancelled = false) {
    const active = gesture.current;
    if (!active) return;
    gesture.current = null;
    if (active.element.hasPointerCapture(active.pointerId))
      active.element.releasePointerCapture(active.pointerId);
    if (cancelled) {
      setDraft(active.before);
      setMessage("Gesture cancelled.");
    } else if (active.kind === "move" && active.target) {
      const index = active.before.findIndex(
        (item) => item.id === active.target,
      );
      setDraft(moveWidget(active.before, active.id, index));
      setMessage(`${titleOf(active.id)} moved to position ${index + 1}.`);
    } else
      setMessage(
        active.kind === "resize"
          ? `${titleOf(active.id)} resized. Save to keep the layout.`
          : "Widget position unchanged.",
      );
    setDragTarget(null);
    setDragging(null);
  }
  return (
    <>
      <div className={`layout-toolbar ${editing ? "editing-toolbar" : ""}`}>
        {editing ? (
          <>
            <div>
              <strong>Edit your layout</strong>
              <p>
                Drag to move. Resize from a corner. Arrow controls work with a
                keyboard.
              </p>
            </div>
            <div className="actions">
              <button
                className="button quiet"
                disabled={saving}
                onClick={() => {
                  setDraft(defaultLayouts[page]);
                  setMessage("Default layout previewed. Save or Cancel.");
                }}
              >
                <RotateCcw size={14} />
                Reset
              </button>
              <button
                className="button"
                disabled={saving}
                onClick={() => {
                  finish(true);
                  setDraft(null);
                  announce("Layout changes cancelled.");
                }}
              >
                Cancel
              </button>
              <button
                className="button primary"
                disabled={saving}
                onClick={async () => {
                  if (!draft) return;
                  setSaving(true);
                  try {
                    const result = await save(
                      JSON.stringify(draft),
                      editVersion.current,
                    );
                    if (result.ok) {
                      setSessionLayout(result.sessionOnly ? draft : null);
                      setDraft(null);
                    }
                    setMessage(result.message);
                    announce(result.message);
                  } catch {
                    setMessage(
                      "Save could not be confirmed. Your draft is still here; reload to check before retrying.",
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Check size={15} />
                {saving ? "Saving…" : "Save layout"}
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="small muted">
              {page === "school"
                ? "YOUR SCHOOL WIDGETS"
                : page === "home"
                  ? "YOUR WORKSPACES"
                  : "YOUR DAILY CANVAS"}
            </span>
            <button
              className="button quiet"
              onClick={() => {
                onExpand(false);
                editVersion.current = version;
                setSessionLayout(null);
                setDraft(layout.map((item) => ({ ...item })));
                setMessage("");
              }}
            >
              <ChevronsLeftRight size={16} />
              Edit layout
            </button>
          </>
        )}
      </div>
      {editing && (
        <p className="layout-announcement" role="status">
          {message ||
            "Changes stay in preview until you save. Leaving this view discards unsaved edits."}
        </p>
      )}
      <div
        ref={grid}
        inert={saving}
        className={`widget-grid ${page}-grid ${editing ? "grid-editing" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && gesture.current) {
            event.preventDefault();
            finish(true);
          }
        }}
      >
        {layout.map((item, index) => (
          <section
            key={item.id}
            aria-label={`${titleOf(item.id)} widget`}
            data-widget={item.id}
            data-wide={item.columns >= 8 || (expanded && item.id === "school")}
            className={`widget ${dragTarget === item.id ? "drop-target" : ""} ${dragging === item.id ? "gesture-active" : ""} ${expanded && item.id === "school" ? "expanded-widget" : ""}`}
            style={
              {
                "--widget-columns":
                  expanded && item.id === "school" ? 12 : item.columns,
                "--widget-height": `${item.height}px`,
              } as CSSProperties
            }
          >
            {editing && (
              <div className="widget-edit-controls">
                <button
                  className="edit-handle icon-button"
                  aria-label={`Drag ${titleOf(item.id)}`}
                  title="Drag to another card, or use arrow keys"
                  onPointerDown={(event) => start(event, item, "move")}
                  onPointerMove={pointerMove}
                  onPointerUp={() => finish()}
                  onPointerCancel={() => finish(true)}
                  onLostPointerCapture={() => finish(true)}
                  onKeyDown={(event) => {
                    if (
                      [
                        "ArrowUp",
                        "ArrowLeft",
                        "ArrowDown",
                        "ArrowRight",
                      ].includes(event.key)
                    ) {
                      event.preventDefault();
                      const to =
                        index +
                        (["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1);
                      if (to >= 0 && to < layout.length) move(item.id, to);
                    }
                  }}
                >
                  <GripVertical size={17} />
                </button>
                <span>
                  {item.columns}/12 <span className="size-note">cols</span>
                </span>
                <button
                  className="icon-button"
                  aria-label={`Move ${titleOf(item.id)} earlier`}
                  disabled={index === 0}
                  onClick={() => move(item.id, index - 1)}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Move ${titleOf(item.id)} later`}
                  disabled={index === layout.length - 1}
                  onClick={() => move(item.id, index + 1)}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Make ${titleOf(item.id)} narrower`}
                  disabled={item.columns === 4}
                  onClick={() => resize(item.id, item.columns - 1, item.height)}
                >
                  <Minus size={14} />
                </button>
                <button
                  className="icon-button"
                  aria-label={`Make ${titleOf(item.id)} wider`}
                  disabled={item.columns === 12}
                  onClick={() => resize(item.id, item.columns + 1, item.height)}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
            {render(item.id, editing)}
            {editing && (
              <span className="sr-only" id={`resize-instructions-${item.id}`}>
                Desktop width {item.columns} of 12 columns. Minimum height{" "}
                {item.height} pixels. Use Left/Right for width and Up/Down for
                height.
              </span>
            )}
            {editing && (
              <button
                className="resize-handle"
                aria-label={`Resize ${titleOf(item.id)}`}
                aria-describedby={`resize-instructions-${item.id}`}
                title="Drag to resize; Left/Right changes columns, Up/Down changes height"
                onPointerDown={(event) => start(event, item, "resize")}
                onPointerMove={pointerMove}
                onPointerUp={() => finish()}
                onPointerCancel={() => finish(true)}
                onLostPointerCapture={() => finish(true)}
                onKeyDown={(event) => {
                  if (
                    ![
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(event.key)
                  )
                    return;
                  event.preventDefault();
                  resize(
                    item.id,
                    item.columns +
                      (event.key === "ArrowRight"
                        ? 1
                        : event.key === "ArrowLeft"
                          ? -1
                          : 0),
                    item.height +
                      (event.key === "ArrowDown"
                        ? 20
                        : event.key === "ArrowUp"
                          ? -20
                          : 0),
                  );
                }}
              >
                <ChevronsLeftRight size={17} />
              </button>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
