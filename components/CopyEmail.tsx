"use client";

import { useState } from "react";

export const OVA_EMAIL = "obsidianvolleyball@gmail.com";

// Copies the academy email to the clipboard instead of opening a mail client
// (mailto: is unreliable and most people copy-paste into webmail anyway).
export default function CopyEmail({
  className,
  children,
  copiedLabel = "Copied to clipboard!",
}: {
  className?: string;
  children: React.ReactNode;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(OVA_EMAIL);
      } else {
        const ta = document.createElement("textarea");
        ta.value = OVA_EMAIL;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — leave the label as-is.
    }
  };

  return (
    <button type="button" onClick={copy} className={className} aria-label={`Copy email address ${OVA_EMAIL}`}>
      {copied ? copiedLabel : children}
    </button>
  );
}
