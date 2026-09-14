"use client";

import type { AdaptationMeasure } from "@/types/domain";
import { SEED_ADAPTATIONS } from "./seed-data";

/**
 * Client-side persistence for the offline/demo path (spec §22): adaptation
 * add/edit/activate/deactivate needs to "stick" across navigation even when
 * the FastAPI backend is unreachable. Backed by localStorage, seeded from the
 * bundled fixtures, and fully reset by "Load Demo Scenario".
 */
const STORAGE_KEY = "climascore:adaptations:v1";

function readAll(): AdaptationMeasure[] {
  if (typeof window === "undefined") return SEED_ADAPTATIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_ADAPTATIONS;
    return JSON.parse(raw) as AdaptationMeasure[];
  } catch {
    return SEED_ADAPTATIONS;
  }
}

function writeAll(items: AdaptationMeasure[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — the demo still works
    // for the current page load, it just won't persist across reloads.
  }
}

export function listLocalAdaptations(msmeId?: string): AdaptationMeasure[] {
  const all = readAll();
  return msmeId ? all.filter((a) => a.msmeId === msmeId) : all;
}

export function upsertLocalAdaptation(measure: AdaptationMeasure): AdaptationMeasure[] {
  const all = readAll();
  const idx = all.findIndex((a) => a.id === measure.id);
  if (idx >= 0) {
    all[idx] = measure;
  } else {
    all.push(measure);
  }
  writeAll(all);
  return all;
}

export function setLocalAdaptationStatus(
  id: string,
  status: AdaptationMeasure["status"],
): AdaptationMeasure[] {
  const all = readAll().map((a) => (a.id === id ? { ...a, status } : a));
  writeAll(all);
  return all;
}

export function deleteLocalAdaptation(id: string): AdaptationMeasure[] {
  const all = readAll().filter((a) => a.id !== id);
  writeAll(all);
  return all;
}

export function resetLocalStore(): void {
  writeAll(SEED_ADAPTATIONS);
}
