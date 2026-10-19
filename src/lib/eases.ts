import type { EaseName } from "@/data/motion";

/** GSAP elastic.out with amplitude 1: f(t) = 2^(-10t) · sin((t - p/4) · 2π/p) + 1 */
const elasticOut = (period: number) => (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin(((t - period / 4) * (2 * Math.PI)) / period) + 1;

/** GSAP's named eases as plain functions, for drawing them (power1 = quad, power4 = quint) */
export const EASES: Record<EaseName, (t: number) => number> = {
  none: (t) => t,
  "power1.inOut": (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  "power4.inOut": (t) => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2),
  "power1.out": (t) => 1 - (1 - t) * (1 - t),
  "power2.in": (t) => t * t * t,
  "power3.out": (t) => 1 - Math.pow(1 - t, 4),
  "elastic.out(1, 0.3)": elasticOut(0.3),
  "elastic.out(1, 0.6)": elasticOut(0.6),
};

/** The range a curve covers, so overshooting eases (elastic) still fit their graph */
export const easeRange = (f: (t: number) => number) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i <= 64; i++) {
    const v = f(i / 64);
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return [lo, hi] as const;
};
