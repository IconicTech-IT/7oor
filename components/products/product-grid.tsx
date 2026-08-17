"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fade, staggerContainer } from "@/lib/motion";

/** Remounted (via `key`) by the parent whenever filters change, so it fades the new result set in. */
export function ProductGrid({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.04)}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={fade}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
