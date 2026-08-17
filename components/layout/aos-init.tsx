"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export function AosInit() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    AOS.init({
      duration: 600,
      once: true,
      offset: 60,
      easing: "ease-out-cubic",
      disable: prefersReducedMotion,
    });
  }, []);

  return null;
}
