"use client";

import { useCallback, useSyncExternalStore } from "react";

const CHANGE_EVENT = "starrboard-preferences";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}
const serverSnapshot = () => null;

/** Only these app-owned UI preferences are persisted; task data stays in memory. */
export function usePreference(
  key: string,
  namespace: "demo" | "private" = "demo",
) {
  const snapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(`starrboard.${namespace}.v1.${key}`);
    } catch {
      return null;
    }
  }, [key, namespace]);
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const save = useCallback(
    (next: string) => {
      try {
        window.localStorage.setItem(`starrboard.${namespace}.v1.${key}`, next);
        window.dispatchEvent(new Event(CHANGE_EVENT));
        return true;
      } catch {
        return false;
      }
    },
    [key, namespace],
  );
  return [value, save] as const;
}
