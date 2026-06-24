import { useEffect, useState } from "react";

type UseCountUpOptions = {
  duration?: number;
  enabled?: boolean;
};

export const useCountUp = (
  target: number,
  { duration = 1400, enabled = true }: UseCountUpOptions = {}
) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    if (target <= 0) {
      setValue(0);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setValue(target);
      return;
    }

    let startTime: number | null = null;
    let animationFrame = 0;

    const animate = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    setValue(0);
    animationFrame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [duration, enabled, target]);

  return value;
};
