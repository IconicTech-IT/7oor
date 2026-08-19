"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

type Tag = "div" | "span" | "h1" | "h2" | "h3" | "p";
type Direction = "up" | "down" | "left" | "right";

type Props = {
  children: ReactNode;
  className?: string;
  as?: Tag;
  direction?: Direction;
  /** Starting offset in px the content travels in from. */
  distance?: number;
  duration?: number;
  /** Seconds. */
  delay?: number;
  scale?: number;
  rotate?: number;
  /** Ties animation progress to scroll instead of a one-shot entrance; number sets the scrub lag in seconds. */
  scrub?: boolean | number;
  ease?: string;
  start?: string;
  /** Play once, or replay on every enter/leave. */
  once?: boolean;
};

/** GSAP ScrollTrigger reveal, scoped to its own element — the single scroll-animation primitive for the whole app. */
export function ScrollReveal({
  children,
  className,
  as = "div",
  direction = "up",
  distance = 60,
  duration = 0.8,
  delay = 0,
  scale,
  rotate,
  scrub = false,
  ease = "back.out(1.4)",
  start = "top 85%",
  once = true,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      const el = ref.current;
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        gsap.set(el, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0 });
        return;
      }

      const from: gsap.TweenVars = { autoAlpha: 0 };
      if (direction === "up") from.y = distance;
      if (direction === "down") from.y = -distance;
      if (direction === "left") from.x = distance;
      if (direction === "right") from.x = -distance;
      if (scale !== undefined) from.scale = scale;
      if (rotate !== undefined) from.rotation = rotate;

      const to: gsap.TweenVars = {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration,
        delay: scrub ? 0 : delay,
        ease: scrub ? "none" : ease,
      };

      if (scrub) {
        gsap.fromTo(el, from, {
          ...to,
          scrollTrigger: { trigger: el, start, end: "bottom top", scrub: typeof scrub === "number" ? scrub : 1 },
        });
      } else {
        gsap.fromTo(el, from, {
          ...to,
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: once ? "play none none none" : "play reverse play reverse",
          },
        });
      }
    },
    { scope: ref, dependencies: [direction, distance, duration, delay, scale, rotate, scrub, ease, start, once] },
  );

  const Component = as;

  return (
    <Component ref={ref as never} className={className} style={{ visibility: "hidden" }}>
      {children}
    </Component>
  );
}
