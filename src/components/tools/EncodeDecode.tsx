"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CopyButton, type ToolProps } from "@/components/tools/shared";

type Mode = "base64" | "url" | "case";

/* ------------------------------ base64 (utf-8) ------------------------------ */

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function base64ToUtf8(b64: string): string {
  const bin = atob(b64.trim());
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* -------------------------------- case words -------------------------------- */

function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.toLowerCase());
}

function toCamel(w: string[]): string {
  return w
    .map((word, i) =>
      i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join("");
}

function toTitle(w: string[]): string {
  return w
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function EncodeDecode({ accent }: ToolProps) {
  const [mode, setMode] = React.useState<Mode>("base64");

  const tabs: { id: Mode; label: string }[] = [
    { id: "base64", label: "Base64" },
    { id: "url", label: "URL" },
    { id: "case", label: "Case" },
  ];

  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Encoding utility"
        className="border-border/60 flex w-fit gap-1 rounded-md border p-1"
      >
        {tabs.map((t) => {
          const active = mode === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setMode(t.id)}
              style={
                active
                  ? { backgroundColor: accent, color: "#0b0f17" }
                  : undefined
              }
              className={cn(
                "focus-visible:ring-ring rounded px-3 py-1.5 font-mono text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none",
                !active && "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {mode === "base64" ? (
        <TwoWay
          accent={accent}
          idBase="b64"
          encodeLabel="Encode"
          decodeLabel="Decode"
          encode={utf8ToBase64}
          decode={base64ToUtf8}
          decodeError="Not valid Base64."
        />
      ) : null}

      {mode === "url" ? (
        <TwoWay
          accent={accent}
          idBase="url"
          encodeLabel="Encode"
          decodeLabel="Decode"
          encode={encodeURIComponent}
          decode={decodeURIComponent}
          decodeError="Not a valid URL-encoded string."
        />
      ) : null}

      {mode === "case" ? <CaseConverter accent={accent} /> : null}
    </div>
  );
}

/* --------------------------- reusable two-way panel --------------------------- */

function TwoWay({
  accent,
  idBase,
  encodeLabel,
  decodeLabel,
  encode,
  decode,
  decodeError,
}: {
  accent: string;
  idBase: string;
  encodeLabel: string;
  decodeLabel: string;
  encode: (s: string) => string;
  decode: (s: string) => string;
  decodeError: string;
}) {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function runEncode() {
    setError(null);
    setOutput(encode(input));
  }
  function runDecode() {
    try {
      setOutput(decode(input));
      setError(null);
    } catch {
      setError(decodeError);
      setOutput("");
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={`${idBase}-in`}
            className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase"
          >
            Input
          </label>
          <Textarea
            id={`${idBase}-in`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            className="h-40 resize-y font-mono text-xs"
            placeholder="Type or paste here"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">
              Output
            </span>
            <CopyButton
              value={output}
              label="Copy"
              disabled={output.length === 0}
            />
          </div>
          <Textarea
            id={`${idBase}-out`}
            value={output}
            readOnly
            spellCheck={false}
            className="h-40 resize-y font-mono text-xs"
            placeholder="Result appears here"
          />
        </div>
      </div>

      {error ? (
        <p className="text-danger font-mono text-xs" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={runEncode}
          style={{ backgroundColor: accent, color: "#0b0f17" }}
        >
          {encodeLabel}
        </Button>
        <Button type="button" variant="outline" onClick={runDecode}>
          {decodeLabel}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------ case converter ------------------------------ */

function CaseConverter({ accent }: { accent: string }) {
  const [input, setInput] = React.useState("");

  const results = React.useMemo(() => {
    const w = words(input);
    if (w.length === 0) return [];
    return [
      { label: "camelCase", value: toCamel(w) },
      { label: "PascalCase", value: toTitle(w).replace(/\s+/g, "") },
      { label: "snake_case", value: w.join("_") },
      { label: "kebab-case", value: w.join("-") },
      { label: "CONSTANT_CASE", value: w.join("_").toUpperCase() },
      { label: "Title Case", value: toTitle(w) },
    ];
  }, [input]);

  return (
    <div className="space-y-3">
      <label
        htmlFor="case-in"
        className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase"
      >
        Input
      </label>
      <Textarea
        id="case-in"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        className="h-24 resize-y font-mono text-xs"
        placeholder="my variable name  ·  my-variable-name  ·  myVariableName"
      />

      {results.length > 0 ? (
        <ul className="ring-border/60 divide-border/50 divide-y rounded-md ring-1">
          {results.map((r) => (
            <li
              key={r.label}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="min-w-0">
                <p
                  className="font-mono text-[0.65rem] tracking-[0.14em] uppercase"
                  style={{ color: accent }}
                >
                  {r.label}
                </p>
                <p className="text-foreground truncate font-mono text-sm">
                  {r.value}
                </p>
              </div>
              <CopyButton value={r.value} label="Copy" variant="ghost" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-xs">
          Type a few words (any style) to see every case.
        </p>
      )}
    </div>
  );
}
