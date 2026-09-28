export type AreaId = "school" | "ta" | "work" | "career" | "projects";
export type Course = "IS 401" | "IS 402" | "IS 403" | "IS 404";
export type SourceId = "byu" | "aws" | "manual";
export type Scenario = "ready" | "loading" | "empty" | "error" | "stale";
export type SchoolTab =
  "All commitments" | "Assignments" | "Readings" | "Sources";
export type DashboardPage =
  "home" | "today" | "school" | "ta" | "career" | "projects" | "automations";
export type WidgetId =
  | "automation-rules"
  | "automation-review"
  | "automation-history"
  | "portfolio-summary"
  | "portfolio-board"
  | "portfolio-milestones"
  | "portfolio-github"
  | "portfolio-existing"
  | "career-summary"
  | "career-pipeline"
  | "career-dates"
  | "career-preparation"
  | "career-resources"
  | AreaId
  | "schedule"
  | "recommendation"
  | "school-progress"
  | "school-coursework"
  | "school-todo"
  | "school-readings"
  | "school-week"
  | "ta-progress"
  | "ta-duties"
  | "ta-agenda"
  | "ta-followups"
  | "ta-resources";

export interface DemoTask {
  id: string;
  area: AreaId;
  title: string;
  course?: Course;
  source: SourceId;
  resource: string;
  due: string;
  estimate: number | null;
  kind: "Assignment" | "Reading" | "Task";
  attention?: string;
  done: boolean;
  notes: string;
}

export interface WidgetLayout {
  id: WidgetId;
  columns: number;
  height: number;
}

export const areas: {
  id: AreaId;
  title: string;
  subtitle: string;
  tone: string;
  unit: string;
}[] = [
  {
    id: "school",
    title: "School",
    subtitle: "Four courses. One clear view.",
    tone: "blue",
    unit: "commitments",
  },
  {
    id: "ta",
    title: "IS 581 TA",
    subtitle: "Make space for your students.",
    tone: "mint",
    unit: "duties",
  },
  {
    id: "work",
    title: "Work",
    subtitle: "Keep the next conversation moving.",
    tone: "violet",
    unit: "follow-ups",
  },
  {
    id: "career",
    title: "Career",
    subtitle: "Build toward what comes next.",
    tone: "blue",
    unit: "next steps",
  },
  {
    id: "projects",
    title: "Projects",
    subtitle: "Small steps. Meaningful progress.",
    tone: "violet",
    unit: "milestone",
  },
];

export const courses: Course[] = ["IS 401", "IS 402", "IS 403", "IS 404"];
export const courseResources: Record<Course, string> = {
  "IS 401": "Canvas · Scrum book",
  "IS 402": "Canvas · O’Reilly",
  "IS 403": "Canvas · MyEducator · Xenos · PDF",
  "IS 404": "BYU Canvas · AWS Canvas",
};

export function filterSchoolTasks(
  tasks: DemoTask[],
  course: Course | "all",
  tab: SchoolTab,
) {
  return tasks.filter(
    (task) =>
      task.area === "school" &&
      (course === "all" || task.course === course) &&
      (tab !== "Readings" || task.kind === "Reading") &&
      (tab !== "Assignments" || task.kind === "Assignment"),
  );
}

export function searchTasks(tasks: DemoTask[], query: string) {
  const normalized = query.toLocaleLowerCase().trim();
  if (!normalized) return [];
  return tasks.filter((task) =>
    [
      task.title,
      task.course,
      task.resource,
      task.area,
      task.source === "byu"
        ? "BYU Canvas"
        : task.source === "aws"
          ? "AWS Canvas"
          : "Manual capture",
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalized),
  );
}

export function calendarConflict(start: string) {
  // Fixed demo day: 15:00–16:15 conflicts with the 16:00 project check-in.
  const hours = Number(start.slice(0, 2));
  const minutePart = Number(start.slice(3));
  const minutes = hours * 60 + minutePart;
  return (
    !/^\d{2}:\d{2}$/.test(start) ||
    hours > 23 ||
    minutePart > 59 ||
    !Number.isFinite(minutes) ||
    minutes < 0 ||
    minutes + 75 > 24 * 60 ||
    [
      [600, 660],
      [720, 780],
      [960, 990],
    ].some(([from, to]) => minutes < to && minutes + 75 > from)
  );
}
