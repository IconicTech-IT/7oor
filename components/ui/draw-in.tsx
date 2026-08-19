"use client";

import { useCallback, useEffect, useRef } from "react";
import { useInView } from "framer-motion";

const DRAWABLE_SELECTOR = "path, circle, line, polyline, polygon, rect, ellipse";

type Props = {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  once?: boolean;
  /** Replay the draw-in whenever the closest `.group` ancestor (icon or its paired label) is hovered/focused. */
  replayOnHover?: boolean;
};

/**
 * Generic "draw itself in" wrapper for ANY svg content, including lucide-react icons —
 * it measures each drawable child's real path length via getTotalLength() and animates
 * stroke-dashoffset with the Web Animations API, so it works without forking icon
 * components into motion.path. Respects prefers-reduced-motion (shows instantly).
 */
export function DrawIn({
  children,
  className,
  duration = 900,
  delay = 0,
  once = true,
  replayOnHover = false,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once, amount: 0.4 });
  const played = useRef(false);

  const play = useCallback(() => {
    if (!ref.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const elements = ref.current.querySelectorAll<SVGGeometryElement>(DRAWABLE_SELECTOR);
    if (elements.length === 0) return;

    elements.forEach((el, i) => {
      if (prefersReduced) {
        el.style.strokeDasharray = "";
        el.style.strokeDashoffset = "";
        return;
      }
      let length = 0;
      try {
        length = el.getTotalLength();
      } catch {
        return;
      }
      el.getAnimations().forEach((a) => a.cancel());
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
      el.animate(
        [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
        {
          duration,
          delay: delay + i * 80,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          fill: "forwards",
        },
      );
    });
  }, [duration, delay]);

  useEffect(() => {
    if (!inView) return;
    if (once && played.current) return;
    played.current = true;
    play();
  }, [inView, once, play]);

  useEffect(() => {
    if (!replayOnHover || !ref.current) return;
    const group = ref.current.closest(".group") ?? ref.current;
    group.addEventListener("mouseenter", play);
    group.addEventListener("focusin", play);
    return () => {
      group.removeEventListener("mouseenter", play);
      group.removeEventListener("focusin", play);
    };
  }, [replayOnHover, play]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
