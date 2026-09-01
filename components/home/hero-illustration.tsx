"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Smartphone, BatteryCharging, PenLine, BookOpen } from "lucide-react";
import { DrawIn } from "@/components/ui/draw-in";

const SATELLITES = [
  { Icon: BatteryCharging, top: "4%", start: "2%", delay: 0.3 },
  { Icon: PenLine, top: "8%", start: "62%", delay: 0.55 },
  { Icon: BookOpen, top: "66%", start: "0%", delay: 0.8 },
] as const;

/** A composed cluster of the same Lucide icons used elsewhere on the site — draws itself
 * in on load rather than requiring bespoke illustration assets. */
export function HeroIllustration() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative hidden h-80 w-80 shrink-0 lg:block xl:h-96 xl:w-96">
      <svg viewBox="0 0 320 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <motion.circle
          cx="160"
          cy="160"
          r="120"
          fill="none"
          stroke="var(--foreground)"
          strokeOpacity="0.15"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          initial={reduceMotion ? { pathLength: 1, opacity: 0.15 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.15 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 1.4, ease: "easeInOut" }}
        />
      </svg>

      <motion.div
        className="absolute inset-0 m-auto flex h-32 w-32 items-center justify-center rounded-[2rem] bg-foreground/5 text-foreground backdrop-blur-sm"
        initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
      >
        <DrawIn duration={900} once>
          <Smartphone className="h-14 w-14" strokeWidth={1.5} />
        </DrawIn>
      </motion.div>

      {SATELLITES.map(({ Icon, top, start, delay }, i) => (
        <motion.div
          key={i}
          className="absolute flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/90 text-accent-foreground shadow-lg"
          style={{ top, insetInlineStart: start }}
          initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.4, delay, type: "spring", stiffness: 260 }
          }
        >
          <DrawIn duration={600} delay={delay * 1000 + 150}>
            <Icon className="h-7 w-7" strokeWidth={1.75} />
          </DrawIn>
        </motion.div>
      ))}
    </div>
  );
}
