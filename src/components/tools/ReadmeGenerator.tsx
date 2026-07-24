"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { Download } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CopyButton,
  downloadText,
  Field,
  markdownClass,
  NativeSelect,
  type ToolProps,
} from "@/components/tools/shared";

type License = "MIT" | "Apache-2.0" | "GPL-3.0" | "None";

/** Split a textarea into trimmed, non-empty lines. */
function lines(value: string): string[] {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/** Split a comma/newline list into trimmed, non-empty items. */
function items(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

function buildReadme(input: {
  name: string;
  description: string;
  stack: string;
  install: string;
  features: string;
  license: License;
}): string {
  const name = input.name.trim() || "Project Name";
  const out: string[] = [`# ${name}`];

  if (input.description.trim()) out.push("", input.description.trim());

  const stack = items(input.stack);
  if (stack.length > 0) {
    out.push("", "## Tech Stack", "");
    for (const s of stack) out.push(`- ${s}`);
  }

  const install = lines(input.install);
  if (install.length > 0) {
    out.push("", "## Installation", "", "```bash");
    for (const step of install) out.push(step);
    out.push("```");
  }

  const feats = lines(input.features);
  if (feats.length > 0) {
    out.push("", "## Features", "");
    for (const f of feats) out.push(`- ${f}`);
  }

  if (input.license !== "None") {
    out.push(
      "",
      "## License",
      "",
      `This project is licensed under the ${input.license} License.`,
    );
  }

  return `${out.join("\n")}\n`;
}

export function ReadmeGenerator(_props: ToolProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [stack, setStack] = React.useState("");
  const [install, setInstall] = React.useState("");
  const [features, setFeatures] = React.useState("");
  const [license, setLicense] = React.useState<License>("MIT");

  const markdown = React.useMemo(
    () => buildReadme({ name, description, stack, install, features, license }),
    [name, description, stack, install, features, license],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Project name" htmlFor="rm-name">
          <Input
            id="rm-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="aws-sbg-toolkit"
          />
        </Field>

        <Field label="Description" htmlFor="rm-desc">
          <Textarea
            id="rm-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="One or two sentences on what it does."
            rows={3}
          />
        </Field>

        <Field
          label="Tech stack"
          htmlFor="rm-stack"
          hint="Comma or newline separated."
        >
          <Input
            id="rm-stack"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="Next.js, TypeScript, Tailwind"
          />
        </Field>

        <Field
          label="Install steps"
          htmlFor="rm-install"
          hint="One command per line — rendered as a bash block."
        >
          <Textarea
            id="rm-install"
            value={install}
            onChange={(e) => setInstall(e.target.value)}
            placeholder={"git clone …\npnpm install\npnpm dev"}
            rows={3}
            className="font-mono text-xs"
          />
        </Field>

        <Field
          label="Features"
          htmlFor="rm-features"
          hint="One per line — rendered as a bullet list."
        >
          <Textarea
            id="rm-features"
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder={"Fast\nOffline-friendly\nNo tracking"}
            rows={3}
          />
        </Field>

        <Field label="License" htmlFor="rm-license">
          <NativeSelect
            id="rm-license"
            value={license}
            onChange={(e) => setLicense(e.target.value as License)}
          >
            <option value="MIT">MIT</option>
            <option value="Apache-2.0">Apache-2.0</option>
            <option value="GPL-3.0">GPL-3.0</option>
            <option value="None">No license section</option>
          </NativeSelect>
        </Field>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">
            Live preview
          </p>
          <div className="flex gap-2">
            <CopyButton value={markdown} label="Copy" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                downloadText(
                  markdown,
                  "README.md",
                  "text/markdown;charset=utf-8",
                )
              }
            >
              <Download />
              .md
            </Button>
          </div>
        </div>

        <div className="ring-border/60 bg-card/40 max-h-[520px] overflow-auto rounded-md p-5 ring-1">
          <div className={markdownClass}>
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
