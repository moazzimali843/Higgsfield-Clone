"use client";

import { useEffect, useRef, useState } from "react";

type MotionRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in milliseconds */
  delay?: number;
};

export function MotionReveal({
  children,
  className = "",
  delay = 0,
}: MotionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "studio-motion-reveal",
        visible ? "studio-motion-reveal--visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--motion-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
