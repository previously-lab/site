"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Client leaf that fetches raw markdown from the `llms.txt` route
 * and copies it to the clipboard. Shows a brief "Copied!" confirmation.
 */
export function CopyMarkdownButton({ url }: { url: string }) {
  const t = useTranslations("Docs");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      // Silently fail — the button simply does nothing
    }
  };

  return (
    <Button variant="outline" size="xs" onClick={handleCopy}>
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          {t("copied")}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {t("copyMarkdown")}
        </>
      )}
    </Button>
  );
}
