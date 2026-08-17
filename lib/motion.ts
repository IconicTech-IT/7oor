import type { Variants } from "framer-motion";

/** Direction-aware slide variants — pass useDirSign() so RTL/LTR both slide in from the true screen edge. */
export function getSlideVariants(dirSign: number): Variants {
  return {
    hidden: { x: 24 * dirSign, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: 24 * dirSign, opacity: 0 },
  };
}

export const fadeUp: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const staggerContainer = (stagger = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
});
