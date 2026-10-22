"use client";

import Icon from "@/components/Icon";
import { btnGhost } from "@/components/ui";

/** Opens the browser's print dialog (which can also "Save as PDF") */
export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={btnGhost}>
      <Icon name="printer" className="h-4 w-4" />
      Print
    </button>
  );
}
