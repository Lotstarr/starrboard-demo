"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  Orbit,
  LayoutDashboard,
  Sun,
  GraduationCap,
  Workflow,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Search,
  Plus,
  Radio,
  Bell,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { areas } from "./model";
import { useWorkspace } from "./store";
import { usePreference } from "./preferences";
import { widgetIcons } from "./icons";
import { WorkspaceDialogs } from "./workspace-dialogs";

export function Navigation({ close }: { close?: () => void }) {
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const { setDrawer } = useWorkspace();
  return (
    <nav
      aria-label={close ? "Mobile primary" : "Primary"}
      className="navigation"
    >
      <p className="nav-caption">Command center</p>
      {[
        { href: "/", title: "Home", Icon: LayoutDashboard },
        { href: "/today", title: "Today", Icon: Sun },
        { href: "/school", title: "School", Icon: GraduationCap },
      ].map(({ href, title, Icon }) => (
        <Link
          key={href}
          href={href}
          className="nav-item"
          aria-current={pathname === href ? "page" : undefined}
          aria-label={title}
          title={title}
          onClick={close}
        >
          <Icon size={18} />
          <span>{title}</span>
        </Link>
      ))}
      {areas
        .filter((area) => area.id !== "school" && area.id !== "work")
        .map((area) => {
          const Icon = widgetIcons[area.id];
          return (
            <button
              key={area.id}
              className="nav-item"
              aria-label={area.title}
              title={area.title}
              onClick={() => setDrawer({ kind: "area", area: area.id })}
            >
              <Icon size={18} />
              <span>{area.title}</span>
            </button>
          );
        })}
      <button
        className="nav-item"
        title="Automations"
        aria-label="Automations"
        onClick={() => setDrawer({ kind: "automations" })}
      >
        <Workflow size={18} />
        <span>Automations</span>
      </button>
      <button
        className="nav-item settings-link"
        title="Settings"
        aria-label="Settings"
        onClick={() => setDrawer({ kind: "settings" })}
      >
        <Settings2 size={18} />
        <span>Settings</span>
      </button>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsedRaw, saveCollapsed] = usePreference("sidebar-collapsed");
  const collapsed = collapsedRaw === "true";
  const { setDrawer, approval, scenario, announce, announcement } =
    useWorkspace();
  const pathname = usePathname().replace(/\/$/, "") || "/";
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setDrawer({ kind: "search" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDrawer]);
  const sourceLabel =
    scenario === "stale"
      ? "AWS stale"
      : scenario === "error"
        ? "Refresh failed"
        : scenario === "loading"
          ? "Loading demo"
          : "Demo sources";
  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="sidebar" aria-label="Command center">
        <Link href="/" className="brand" aria-label="Starrboard home">
          <span className="brand-mark">
            <Orbit size={22} />
          </span>
          <span className="brand-name">starrboard</span>
        </Link>
        <button
          className="sidebar-toggle icon-button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => {
            if (!saveCollapsed(String(!collapsed)))
              announce(
                "Browser storage is unavailable; the sidebar preference could not be saved.",
              );
          }}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
        <Navigation />
        <div className="profile">
          <div className="avatar" aria-hidden="true">
            JD
          </div>
          <div className="profile-copy">
            Jordan Demo<small>Fictional workspace</small>
          </div>
        </div>
        <span className="sidebar-demo">DEMO</span>
      </aside>
      <div className="workspace">
        <header className="command-bar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setDrawer({ kind: "navigation" })}
          >
            <Menu size={20} />
          </button>
          <button
            className="search-trigger"
            onClick={() => setDrawer({ kind: "search" })}
          >
            <Search size={17} />
            <span>Search or jump to…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="command-actions">
            <button
              className="button"
              onClick={() => setDrawer({ kind: "capture", area: "school" })}
            >
              <Plus size={16} />
              <span>Capture</span>
            </button>
            <button
              aria-label={sourceLabel}
              title={sourceLabel}
              className={`button quiet source-command ${scenario === "stale" || scenario === "error" ? "warning" : ""}`}
              onClick={() => setDrawer({ kind: "sources" })}
            >
              <Radio size={16} />
              <span>{sourceLabel}</span>
            </button>
            <button
              className="button quiet"
              aria-label={`Approvals, ${approval === "pending" ? "1 pending" : "none pending"}`}
              onClick={() => setDrawer({ kind: "approval" })}
            >
              <Bell size={16} />
              <span className="count-badge">
                {approval === "pending" ? 1 : 0}
              </span>
            </button>
            <button
              className="button primary"
              onClick={() => setDrawer({ kind: "ai" })}
            >
              <Sparkles size={16} />
              <span>Ask AI</span>
            </button>
          </div>
        </header>
        <div className="workspace-trail">
          <span>Personal workspace</span>
          <ChevronRight size={12} />
          <span>
            {pathname === "/school"
              ? "School"
              : pathname === "/today"
                ? "Today"
                : "Home"}
          </span>
          <span className="demo-label">Fictional demo · Sep 21, 2026</span>
        </div>
        {children}
        <footer className="workspace-footer">
          <span>Demo only · no accounts connected</span>
          <span>Interactive portfolio sample</span>
          <button onClick={() => setDrawer({ kind: "settings" })}>
            Demo controls
          </button>
        </footer>
      </div>
      <div
        className="toast"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        key={announcement}
      >
        {announcement}
      </div>
      <WorkspaceDialogs />
    </div>
  );
}
