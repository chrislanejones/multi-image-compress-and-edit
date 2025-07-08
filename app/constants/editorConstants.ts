import type { CoreWebVitalsScore } from "@/types";

export const COMPRESSION_LEVELS = [
  { value: "low", label: "Low (Best Quality)", quality: 95 },
  { value: "medium", label: "Medium (Balanced)", quality: 85 },
  { value: "high", label: "High (Smaller File)", quality: 75 },
  { value: "extremeSmall", label: "Extreme (Smallest File)", quality: 60 },
  { value: "extremeBW", label: "Extreme B&W (Black & White)", quality: 30 },
] as const;

export const CORE_WEB_VITALS = {
  LCP_THRESHOLD_GOOD: 1200 * 900,
  LCP_THRESHOLD_POOR: 1800 * 1200,
  BUFFER: 20000,
} as const;
