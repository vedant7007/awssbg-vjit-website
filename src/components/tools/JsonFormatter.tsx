"use client";

import * as React from "react";
import { AlignLeft, Minimize2 } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CopyButton,
  NativeSelect,
  type ToolProps,
} from "@/components/tools/shared";

type Indent = "2" | "4" | "tab";

const SAMPLE = `{"club":"AWS SBG VJIT","members":42,"active":true,"teams":["tech","design","content"]}`;

/** Turn an indent choice into the value JSON.stringify expects. */
function indentValue(indent: Indent): string | number {
  if (indent === "tab") return "\t";
  return Number(indent);
}

export function JsonFormatter({ accent }: ToolProps) {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [indent, setIndent] = React.useState<Indent>("2");

  function run(minify: boolean) {
    if (input.trim().length === 0) {
      setError("Nothing to parse yet — paste some JSON above.");
      setOutput("");
      return;
    }
    try {
      const parsed: unknown = JSON.parse(input);
      setOutput(
        minify
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, indentValue(indent)),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON.");
      setOutput("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="json-in"
              className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase"
            >
              Input
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setInput(SAMPLE);
                setError(null);
                setOutput("");
              }}
            >
              Load sample
            </Button>
          </div>
          <Textarea
            id="json-in"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"paste":"your JSON here"}'
            spellCheck={false}
            className="h-72 resize-y font-mono text-xs"
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
            id="json-out"
            value={output}
            readOnly
            placeholder="Formatted JSON appears here."
            spellCheck={false}
            className="h-72 resize-y font-mono text-xs"
          />
        </div>
      </div>

      {error ? (
        <p
          className="text-danger ring-danger/40 bg-danger/5 rounded-md px-4 py-2 font-mono text-xs ring-1"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="json-indent"
            className="text-muted-foreground font-mono text-xs"
          >
            Indent
          </label>
          <NativeSelect
            id="json-indent"
            value={indent}
            onChange={(e) => setIndent(e.target.value as Indent)}
            className="h-9 w-28"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </NativeSelect>
        </div>
        <Button
          type="button"
          onClick={() => run(false)}
          style={{ backgroundColor: accent, color: "#0b0f17" }}
        >
          <AlignLeft />
          Format
        </Button>
        <Button type="button" variant="outline" onClick={() => run(true)}>
          <Minimize2 />
          Minify
        </Button>
      </div>
    </div>
  );
}
