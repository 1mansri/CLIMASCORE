/**
 * Shared UI primitive barrel. Import from "@/components/ui" rather than
 * reaching into individual files — in particular, ProvenanceBadge and
 * MetricWithRange are mandatory building blocks for any new data screen:
 * every number or claim on screen must carry a ProvenanceBadge (spec §25).
 */
export * from "./button";
export * from "./card";
export * from "./badge";
export * from "./tabs";
export * from "./dialog";
export * from "./provenance-badge";
export * from "./metric-with-range";
export * from "./risk-gauge";
export * from "./comparison-panel";
