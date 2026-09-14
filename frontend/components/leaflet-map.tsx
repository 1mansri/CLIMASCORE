"use client";

import * as React from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Tooltip } from "react-leaflet";
import { RISK_BAND_TONE } from "@/lib/formatting";
import type { Msme } from "@/types/domain";

const TONE_HEX: Record<"red" | "amber" | "green", string> = {
  red: "#c83b3b",
  amber: "#b8791a",
  green: "#258a62",
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

/** Falls back to OpenStreetMap tiles (no key required) unless a Mapbox token is configured — spec §17 Screen 3 / §22. */
const TILE_URL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const TILE_ATTRIBUTION = MAPBOX_TOKEN
  ? '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface MsmeMapProps {
  msmes: Msme[];
  highlightId?: string;
  center?: [number, number];
  zoom?: number;
  /** Illustrative hazard-exposure rings around the highlighted borrower (spec §17 Screen 3 layers). */
  showHazardLayers?: boolean;
  className?: string;
  heightClassName?: string;
}

export function MsmeMap({
  msmes,
  highlightId,
  center,
  zoom = 12,
  showHazardLayers = false,
  className,
  heightClassName = "h-96",
}: MsmeMapProps) {
  const focal = msmes.find((m) => m.id === highlightId) ?? msmes[0];
  const mapCenter: [number, number] = center ?? (focal ? [focal.latitude, focal.longitude] : [21.1702, 72.8311]);

  return (
    <div className={className}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className={heightClassName}
        style={{ width: "100%" }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        {showHazardLayers && focal && (
          <>
            <Circle
              center={[focal.latitude, focal.longitude]}
              radius={1400}
              pathOptions={{ color: "#1769e0", fillColor: "#1769e0", fillOpacity: 0.08, weight: 1 }}
            >
              <Tooltip direction="top">Flood exposure zone (illustrative)</Tooltip>
            </Circle>
            <Circle
              center={[focal.latitude, focal.longitude]}
              radius={2400}
              pathOptions={{ color: "#c83b3b", fillColor: "#c83b3b", fillOpacity: 0.05, weight: 1, dashArray: "4 4" }}
            >
              <Tooltip direction="top">Heat exposure zone (illustrative)</Tooltip>
            </Circle>
            <Circle
              center={[focal.latitude, focal.longitude]}
              radius={3600}
              pathOptions={{ color: "#0b1736", fillColor: "#0b1736", fillOpacity: 0.03, weight: 1, dashArray: "1 6" }}
            >
              <Tooltip direction="top">Industrial cluster (illustrative)</Tooltip>
            </Circle>
          </>
        )}
        {msmes.map((m) => {
          const tone = RISK_BAND_TONE[m.riskBand];
          const isHighlighted = m.id === highlightId;
          return (
            <CircleMarker
              key={m.id}
              center={[m.latitude, m.longitude]}
              radius={isHighlighted ? 11 : 7}
              pathOptions={{
                color: isHighlighted ? "#0b1736" : TONE_HEX[tone],
                weight: isHighlighted ? 3 : 2,
                fillColor: TONE_HEX[tone],
                fillOpacity: 0.85,
              }}
            >
              <Tooltip direction="top">
                {m.name} — {m.riskBand} ({m.baselineRiskScore}/100)
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      {!MAPBOX_TOKEN && (
        <p className="mt-2 text-xs text-text-muted">
          Showing OpenStreetMap tiles (no API key required for demo mode). Set NEXT_PUBLIC_MAPBOX_TOKEN to use Mapbox tiles instead.
        </p>
      )}
    </div>
  );
}
