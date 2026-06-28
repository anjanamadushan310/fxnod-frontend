"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

interface AnchoredPopoverProps {
  /** Element the popover positions itself under. */
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  /** Gap (px) between the anchor's bottom edge and the popover. */
  gap?: number;
}

/**
 * Floating overlay anchored under a trigger (Deriv §7 picker behavior).
 *
 * Rendered through a portal so the order panel's `overflow-y-auto` can't clip
 * it — but the portal target is the `[data-app="options"]` subtree (not
 * <body>) so the scoped `--opt-*` theme tokens still apply inside the picker.
 * Position is `fixed` against the live anchor rect (re-measured on scroll /
 * resize). Dismisses on Escape or an outside click.
 */
export function AnchoredPopover({
  anchorRef,
  onClose,
  children,
  gap = 6,
}: AnchoredPopoverProps) {
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [target, setTarget] = useState<Element | null>(null);

  // Resolve the portal target on the client only.
  useEffect(() => {
    setTarget(
      document.querySelector('[data-app="options"]') ?? document.body,
    );
  }, []);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const update = () => {
      const r = anchor.getBoundingClientRect();
      setPos({ top: r.bottom + gap, left: r.left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchorRef, gap]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    // Defer one tick so the click that opened the popover doesn't close it.
    const id = setTimeout(
      () => document.addEventListener("mousedown", onDown),
      0,
    );
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(id);
      document.removeEventListener("mousedown", onDown);
    };
  }, [onClose, anchorRef]);

  if (!target || !pos) return null;

  return createPortal(
    <div
      ref={popRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 60 }}
    >
      {children}
    </div>,
    target,
  );
}
