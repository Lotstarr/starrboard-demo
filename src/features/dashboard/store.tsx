"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { initialTasks } from "./fixtures";
import type { AreaId, Course, DemoTask, Scenario, SchoolTab } from "./model";

export type Drawer =
  | { kind: "task"; id: string }
  | { kind: "area"; area: AreaId }
  | { kind: "capture"; area: AreaId }
  | {
      kind:
        | "search"
        | "ai"
        | "approval"
        | "sources"
        | "settings"
        | "automations"
        | "navigation";
    }
  | null;

function useWorkspaceState() {
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [course, setCourse] = useState<Course | "all">("all");
  const [schoolTab, setSchoolTab] = useState<SchoolTab>("All commitments");
  const [scenario, setScenarioState] = useState<Scenario>("ready");
  const [announcement, announce] = useState("");
  useEffect(() => {
    if (!announcement) return;
    const timer = setTimeout(() => announce(""), 7000);
    return () => clearTimeout(timer);
  }, [announcement]);
  const [approval, setApproval] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );
  const [proposedTime, setProposedTime] = useState("15:00");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    },
    [],
  );

  function setScenario(value: Scenario) {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setScenarioState(value);
    announce(`School demo: ${value}. No provider was contacted.`);
  }
  function refresh() {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    setScenarioState("loading");
    refreshTimer.current = setTimeout(() => {
      setScenarioState("ready");
      announce("Demo snapshots restored. No provider was contacted.");
    }, 650);
  }
  function updateTask(
    id: string,
    changes: Partial<Pick<DemoTask, "done" | "notes" | "estimate">>,
  ) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...changes } : task)),
    );
  }
  function capture(task: Omit<DemoTask, "id" | "done" | "notes" | "source">) {
    setTasks((current) => [
      ...current,
      {
        ...task,
        id: `manual-${crypto.randomUUID()}`,
        source: "manual",
        done: false,
        notes: "",
      },
    ]);
    setScenario("ready");
    setDrawer({ kind: "area", area: task.area });
    announce(
      "Demo task captured for this session. Refreshing the app clears demo changes.",
    );
  }
  return {
    tasks,
    drawer,
    setDrawer,
    course,
    setCourse,
    schoolTab,
    setSchoolTab,
    scenario,
    setScenario,
    refresh,
    announcement,
    announce,
    updateTask,
    capture,
    approval,
    setApproval,
    proposedTime,
    setProposedTime,
  };
}

const WorkspaceContext = createContext<ReturnType<
  typeof useWorkspaceState
> | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceState();
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const state = useContext(WorkspaceContext);
  if (!state) throw new Error("WorkspaceProvider is required");
  return state;
}
