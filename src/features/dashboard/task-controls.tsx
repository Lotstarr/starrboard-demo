"use client";

import { Check } from "lucide-react";
import type { DemoTask } from "./model";
import { useWorkspace } from "./store";

export function DemoTaskCheck({ task }: { task: DemoTask }) {
  const { updateTask, announce } = useWorkspace();
  return (
    <button
      className={`overview-check ${task.done ? "checked" : ""}`}
      role="checkbox"
      aria-checked={task.done}
      aria-label={`${task.done ? "Mark incomplete" : "Complete"}: ${task.title}`}
      title="Update demo progress"
      onClick={() => {
        updateTask(task.id, { done: !task.done });
        announce(
          task.done
            ? "Local demo completion cleared."
            : "Marked locally complete. Source status is unchanged.",
        );
      }}
    >
      {task.done && <Check size={14} />}
    </button>
  );
}
