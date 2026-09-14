"use client";

import dynamic from "next/dynamic";
import type { MsmeMapProps } from "@/components/leaflet-map";

/**
 * Leaflet touches `window` at import time, so it must never be part of the
 * server-rendered bundle — dynamic-import with ssr disabled is the standard
 * fix and keeps every page that shows a map working without extra config.
 */
export const MsmeMap = dynamic<MsmeMapProps>(() => import("@/components/leaflet-map").then((m) => m.MsmeMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 w-full items-center justify-center border border-border bg-light-blue text-sm text-text-muted">
      Loading map…
    </div>
  ),
});
