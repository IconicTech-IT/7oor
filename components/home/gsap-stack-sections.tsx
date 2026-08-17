"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function GsapStackSections({ sections }: { sections: ReactNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".gsap-panel");
      panels.forEach((panel, i) => {
        if (i === panels.length - 1) return;
        ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          pin: true,
          pinSpacing: false,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {sections.map((section, i) => (
        <section
          key={i}
          className="gsap-panel relative h-screen w-full overflow-hidden"
          style={{ zIndex: i + 1 }}
        >
          {section}
        </section>
      ))}
    </div>
  );
}
