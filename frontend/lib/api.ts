import type {
  AdaptationMeasure,
  ClimateEvent,
  CounterfactualRun,
  EvidenceItem,
  Msme,
  PortfolioSummary,
} from "@/types/domain";
import {
  SEED_EVENTS,
  SEED_MSMES,
  adaptationsForMsme,
  computePortfolioSummary,
  evidenceFor,
  findEvent,
  findMsme,
} from "./seed-data";
import { runCounterfactual as runCounterfactualLocal } from "./counterfactual";
import {
  deleteLocalAdaptation,
  listLocalAdaptations,
  resetLocalStore,
  setLocalAdaptationStatus,
  upsertLocalAdaptation,
} from "./local-store";

/**
 * Typed fetch client against the FastAPI backend (spec §21), mounted under
 * /api/v1 per the coordination note with the backend engineer. Every function
 * here falls back to bundled seed data / local client-side state when the
 * network call fails, times out, or the backend simply isn't running yet —
 * this is what keeps the app demoable offline (spec §22) and lets the UI be
 * built and inspected before the backend exists.
 *
 * API contract assumptions (cross-check against the backend):
 *   GET    /api/v1/health
 *   GET    /api/v1/msmes
 *   GET    /api/v1/msmes/{id}
 *   GET    /api/v1/msmes/{id}/risk
 *   GET    /api/v1/events
 *   GET    /api/v1/events/{id}
 *   GET    /api/v1/msmes/{id}/adaptations
 *   POST   /api/v1/msmes/{id}/adaptations
 *   PUT    /api/v1/adaptations/{id}
 *   DELETE /api/v1/adaptations/{id}
 *   POST   /api/v1/counterfactual/run   body: { msme_id, event_id, adaptations: string[] (type slugs) }
 *   GET    /api/v1/msmes/{id}/evidence
 *   GET    /api/v1/portfolio/summary
 *   GET    /api/v1/portfolio/risk-map
 *   POST   /api/v1/demo/reset
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000/api/v1";

const FETCH_TIMEOUT_MS = 3500;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function withFallback<T>(live: () => Promise<T>, fallback: () => T): Promise<{ data: T; source: "api" | "seed" }> {
  try {
    const data = await live();
    return { data, source: "api" };
  } catch {
    return { data: fallback(), source: "seed" };
  }
}

export async function fetchHealth(): Promise<{ status: string; source: "api" | "seed" }> {
  const { data, source } = await withFallback(
    () => apiFetch<{ status: string }>("/health"),
    () => ({ status: "offline-demo" }),
  );
  return { ...data, source };
}

export async function fetchMsmes(): Promise<Msme[]> {
  const { data } = await withFallback(
    () => apiFetch<Msme[]>("/msmes"),
    () => SEED_MSMES,
  );
  return data;
}

export async function fetchMsme(id: string): Promise<Msme | undefined> {
  const { data } = await withFallback(
    () => apiFetch<Msme>(`/msmes/${id}`),
    () => findMsme(id),
  );
  return data;
}

export async function fetchEvents(): Promise<ClimateEvent[]> {
  const { data } = await withFallback(
    () => apiFetch<ClimateEvent[]>("/events"),
    () => SEED_EVENTS,
  );
  return data;
}

export async function fetchEvent(id: string): Promise<ClimateEvent | undefined> {
  const { data } = await withFallback(
    () => apiFetch<ClimateEvent>(`/events/${id}`),
    () => findEvent(id),
  );
  return data;
}

export async function fetchAdaptations(msmeId: string): Promise<AdaptationMeasure[]> {
  const { data } = await withFallback(
    () => apiFetch<AdaptationMeasure[]>(`/msmes/${msmeId}/adaptations`),
    () => (typeof window === "undefined" ? adaptationsForMsme(msmeId) : listLocalAdaptations(msmeId)),
  );
  return data;
}

export async function saveAdaptation(measure: AdaptationMeasure): Promise<AdaptationMeasure> {
  const { data } = await withFallback(
    () =>
      apiFetch<AdaptationMeasure>(`/msmes/${measure.msmeId}/adaptations`, {
        method: "POST",
        body: JSON.stringify(measure),
      }),
    () => {
      upsertLocalAdaptation(measure);
      return measure;
    },
  );
  return data;
}

export async function setAdaptationStatus(
  id: string,
  status: AdaptationMeasure["status"],
): Promise<void> {
  await withFallback(
    () => apiFetch<void>(`/adaptations/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
    () => {
      setLocalAdaptationStatus(id, status);
      return undefined;
    },
  );
}

export async function removeAdaptation(id: string): Promise<void> {
  await withFallback(
    () => apiFetch<void>(`/adaptations/${id}`, { method: "DELETE" }),
    () => {
      deleteLocalAdaptation(id);
      return undefined;
    },
  );
}

export async function fetchEvidence(msmeId: string, eventId?: string): Promise<EvidenceItem[]> {
  const { data } = await withFallback(
    () => apiFetch<EvidenceItem[]>(`/msmes/${msmeId}/evidence${eventId ? `?event_id=${eventId}` : ""}`),
    () => evidenceFor(msmeId, eventId),
  );
  return data;
}

export async function postCounterfactualRun(
  msmeId: string,
  eventId: string,
  adaptationTypes: string[],
): Promise<{ run: CounterfactualRun; source: "api" | "seed" }> {
  const { data, source } = await withFallback(
    () =>
      apiFetch<CounterfactualRun>("/counterfactual/run", {
        method: "POST",
        body: JSON.stringify({ msme_id: msmeId, event_id: eventId, adaptations: adaptationTypes }),
      }),
    () => {
      const msme = findMsme(msmeId);
      const event = findEvent(eventId);
      const adaptations = typeof window === "undefined" ? adaptationsForMsme(msmeId) : listLocalAdaptations(msmeId);
      if (!msme || !event) {
        throw new Error(`Unknown msmeId/eventId: ${msmeId}/${eventId}`);
      }
      const wanted = new Set(adaptationTypes);
      const ids = adaptations.filter((a) => wanted.has(a.type)).map((a) => a.id);
      return runCounterfactualLocal(msme, event, adaptations, ids);
    },
  );
  return { run: data, source };
}

export async function fetchPortfolioSummary(): Promise<PortfolioSummary> {
  const { data } = await withFallback(
    () => apiFetch<PortfolioSummary>("/portfolio/summary"),
    () => computePortfolioSummary(),
  );
  return data;
}

export async function fetchPortfolioRiskMap(): Promise<Msme[]> {
  const { data } = await withFallback(
    () => apiFetch<Msme[]>("/portfolio/risk-map"),
    () => SEED_MSMES,
  );
  return data;
}

/** POST /api/v1/demo/reset — falls back to clearing local adaptation overrides. */
export async function resetDemoScenario(): Promise<void> {
  await withFallback(
    () => apiFetch<void>("/demo/reset", { method: "POST" }),
    () => {
      resetLocalStore();
      return undefined;
    },
  );
  resetLocalStore();
}
