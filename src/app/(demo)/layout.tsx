import { WorkspaceProvider } from "@/features/dashboard/store";
import { AppShell } from "@/features/dashboard/shell";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
