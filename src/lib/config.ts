/** Fictional routes never consume private provider settings. */
export function readAppConfig(environment: { STARRBOARD_MODE?: string }) {
  const mode = environment.STARRBOARD_MODE ?? "demo";

  if (mode !== "demo") {
    throw new Error(
      "STARRBOARD_MODE must be demo. Private access uses the separate /app route.",
    );
  }

  return { mode, integrationsEnabled: false } as const;
}
