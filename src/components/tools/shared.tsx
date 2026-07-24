"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

/** Every tool renders inside the hub's frame and gets its accent colour. */
export type ToolProps = { accent: string };

/** Human file size — bytes below 1 KB stay raw, then KB, then MB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

/** Trigger a browser download for a blob. Handler-only (touches the DOM). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Download a string as a text file. */
export function downloadText(
  text: string,
  filename: string,
  mime = "text/plain;charset=utf-8",
): void {
  downloadBlob(new Blob([text], { type: mime }), filename);
}

/** Copy-to-clipboard button with a "copied" confirmation flash. */
export function CopyButton({
  value,
  label = "Copy",
  disabled = false,
  className,
  variant = "outline",
  size = "sm",
}: {
  value: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be blocked (insecure context / denied permission).
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={onCopy}
      disabled={disabled || value.length === 0}
      className={className}
      aria-label={label}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : label}
    </Button>
  );
}

/** Native <select> styled to match the shared Input. */
export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full cursor-pointer rounded-sm border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
NativeSelect.displayName = "NativeSelect";

/** Label + control stack used across the tool forms. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-foreground block font-mono text-xs tracking-[0.12em] uppercase"
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p className="text-muted-foreground text-xs leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}

/** Shared range slider that tints its track with the tool accent. */
export function AccentRange({
  accent,
  className,
  ...props
}: { accent: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn(
        "focus-visible:ring-ring h-2 w-full cursor-pointer appearance-none rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      style={{ accentColor: accent }}
      {...props}
    />
  );
}

/**
 * Tailwind arbitrary-variant classes that style the raw HTML react-markdown
 * emits, so the README preview reads without the typography plugin.
 */
export const markdownClass = cn(
  "text-sm leading-relaxed break-words",
  "[&_h1]:font-display [&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight",
  "[&_h2]:font-display [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:font-display [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_p]:my-2 [&_p]:text-muted-foreground",
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted-foreground",
  "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-muted-foreground",
  "[&_li]:my-1",
  "[&_a]:text-orange [&_a]:underline [&_a]:underline-offset-2",
  "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
  "[&_pre]:bg-muted [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:p-3",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_hr]:border-border/60 [&_hr]:my-4",
  "[&_blockquote]:border-border [&_blockquote]:text-muted-foreground [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic",
  "[&_table]:my-3 [&_table]:w-full [&_table]:text-left [&_th]:border-border/60 [&_th]:border-b [&_th]:py-1 [&_td]:py-1",
);
