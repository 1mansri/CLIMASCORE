"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Msme } from "@/types/domain";

const BAND_ORDER = ["Low", "Moderate", "High", "Severe"] as const;
const BAND_COLOR: Record<(typeof BAND_ORDER)[number], string> = {
  Low: "#258a62",
  Moderate: "#b8791a",
  High: "#c83b3b",
  Severe: "#a93232",
};

/** Portfolio risk-band distribution (spec §17 Screen 9). Recharts, per the recommended stack (spec §19). */
export function RiskDistributionChart({ msmes }: { msmes: Msme[] }) {
  const data = BAND_ORDER.map((band) => ({
    band,
    count: msmes.filter((m) => m.riskBand === band).length,
  })).filter((d) => d.count > 0 || BAND_ORDER.includes(d.band));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" vertical={false} />
          <XAxis dataKey="band" tick={{ fontSize: 12, fill: "#4b5568" }} axisLine={{ stroke: "#dbe2ea" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#4b5568" }} axisLine={false} tickLine={false} />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.band} fill={BAND_COLOR[d.band]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
