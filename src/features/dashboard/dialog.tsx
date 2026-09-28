"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({
  title,
  close,
  children,
  variant = "drawer",
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  variant?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog.showModal();
    if (variant === "command-dialog") dialog.querySelector("input")?.focus();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, [variant]);
  return (
    <dialog
      ref={ref}
      className={`dialog ${variant}`}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div className="dialog-header">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
}
