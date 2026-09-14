"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui";

export function PrintButton() {
  return (
    <Button variant="secondary" size="sm" onClick={() => window.print()} className="no-print">
      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
      Print / Save as PDF
    </Button>
  );
}
