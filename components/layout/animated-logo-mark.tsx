"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedLogoMark({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  const finalState = { pathLength: 1, opacity: 1, fillOpacity: 1, scale: 1 };

  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
      <motion.rect
        x="2"
        y="2"
        width="32"
        height="32"
        rx="10"
        stroke="var(--primary)"
        strokeWidth="2.5"
        fill="var(--primary)"
        initial={reduceMotion ? finalState : { pathLength: 0, fillOpacity: 0 }}
        animate={finalState}
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                pathLength: { duration: 0.6, ease: "easeInOut" },
                fillOpacity: { duration: 0.4, delay: 0.5 },
              }
        }
      />
      <motion.path
        d="M11 12 H25 L15 27"
        stroke="var(--primary-foreground)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? finalState : { pathLength: 0, opacity: 0 }}
        animate={finalState}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.7, ease: "easeInOut" }}
      />
      <motion.circle
        cx="27"
        cy="9"
        r="3"
        fill="var(--accent)"
        initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.35, delay: 1.1, type: "spring", stiffness: 320 }
        }
      />
    </svg>
  );
}
