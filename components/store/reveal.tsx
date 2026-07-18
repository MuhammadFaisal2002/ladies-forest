"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Animate direct children with a stagger instead of the wrapper itself. */
  stagger?: boolean;
  delay?: number;
  y?: number;
};

/**
 * Scroll-reveal wrapper (DESIGN.md "Motion"): fade-up on enter, once.
 * Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  delay = 0,
  y = 24,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const targets = stagger
        ? Array.from(ref.current.children)
        : [ref.current];
      if (!targets.length) return;

      gsap.set(targets, { opacity: 0, y });
      ScrollTrigger.batch(targets, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: stagger ? 0.08 : 0,
            delay,
            overwrite: true,
          }),
      });
    },
    { scope: ref, dependencies: [stagger, delay, y] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
