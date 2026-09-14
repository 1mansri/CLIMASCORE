"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { resetDemoScenario } from "@/lib/api";

/**
 * "Load Demo Scenario" (spec §22) — resets adaptation state back to the
 * deterministic Surat seed. Always works even if the backend is down,
 * because resetDemoScenario() falls back to clearing local overrides.
 * Also bound to Shift+D as a safety net for live judging.
 */
export function DemoModeButton() {
  const router = useRouter();
  const [resetting, setResetting] = React.useState(false);
  const [justReset, setJustReset] = React.useState(false);

  const handleReset = React.useCallback(async () => {
    setResetting(true);
    try {
      await resetDemoScenario();
      setJustReset(true);
      router.refresh();
      window.setTimeout(() => setJustReset(false), 2000);
    } finally {
      setResetting(false);
    }
  }, [router]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        void handleReset();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleReset]);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => void handleReset()}
      disabled={resetting}
      title="Reset to the deterministic Surat demo scenario (Shift+D)"
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      {justReset ? "Demo scenario loaded" : resetting ? "Loading…" : "Load Demo Scenario"}
    </Button>
  );
}
