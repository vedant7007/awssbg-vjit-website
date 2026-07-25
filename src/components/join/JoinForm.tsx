"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, PartyPopper } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/constants/routes";
import { DISCORD_INVITE } from "@/lib/constants/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitApplication } from "@/app/(marketing)/join/actions";

const YEARS = ["1", "2", "3", "4"];
const BRANCHES = [
  "CSE",
  "CSE AI&ML",
  "CSE DS",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
];
const SECTIONS = ["A", "B", "C", "D"];
const DOMAINS = [
  "AI / Generative AI",
  "Cloud Computing",
  "Web Development",
  "App Development",
  "Cybersecurity",
  "Data Science",
  "UI/UX Design",
  "Business & Management",
  "DevOps",
  "Game Development",
  "Blockchain",
];
const FOCUSING = [
  "Learning new skills",
  "Building projects",
  "Hackathons",
  "Internships",
  "Certifications",
  "Freelancing",
  "Open Source",
  "Placements",
  "Networking",
  "Exploring domains",
];
const WANTS = [
  "Learning resources",
  "Internship opportunities",
  "Networking",
  "Workshops",
  "Hackathons",
  "Project collaborations",
  "Career guidance",
  "Certification guidance",
  "Tech discussions",
  "Community activities",
];
const PROJECTS = ["Yes", "No", "Currently Working"];

type Data = {
  name: string;
  email: string;
  whatsapp: string;
  year: string;
  branch: string;
  section: string;
  domains: string[];
  focusing: string[];
  wants: string[];
  projects: string;
  linkedin: string;
  github: string;
  learn: string;
  why: string;
};

const EMPTY: Data = {
  name: "",
  email: "",
  whatsapp: "",
  year: "",
  branch: "",
  section: "",
  domains: [],
  focusing: [],
  wants: [],
  projects: "",
  linkedin: "",
  github: "",
  learn: "",
  why: "",
};

const STEPS = ["You", "Studies", "Interests", "About you"] as const;

export function JoinForm() {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState<Data>(EMPTY);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const set = <K extends keyof Data>(k: K, v: Data[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggle = (k: "domains" | "focusing" | "wants", v: string) =>
    setData((d) => ({
      ...d,
      [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v],
    }));

  const stepValid = (i: number): boolean => {
    if (i === 0) return !!(data.name && data.email && data.whatsapp);
    if (i === 1) return !!(data.year && data.branch && data.section);
    if (i === 2) return data.domains.length > 0;
    if (i === 3) return !!(data.projects && data.learn);
    return true;
  };

  const next = () => {
    setError(null);
    if (!stepValid(step)) {
      setError("Fill the required fields to continue.");
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else submit();
  };

  const submit = () => {
    const fd = new FormData();
    fd.set("name", data.name);
    fd.set("email", data.email);
    fd.set("whatsapp", data.whatsapp);
    fd.set("year", data.year);
    fd.set("branch", data.branch);
    fd.set("section", data.section);
    data.domains.forEach((d) => fd.append("domains", d));
    data.focusing.forEach((d) => fd.append("focusing", d));
    data.wants.forEach((d) => fd.append("wants", d));
    fd.set("projects", data.projects);
    fd.set("linkedin", data.linkedin);
    fd.set("github", data.github);
    fd.set("learn", data.learn);
    fd.set("why", data.why);

    startTransition(async () => {
      const res = await submitApplication(fd);
      if (res.ok) setDone(true);
      else setError(res.error ?? "Couldn't submit. Try again?");
    });
  };

  if (done) return <Success name={data.name} />;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* progress */}
      <div className="mb-10 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-2">
            <div
              className={cn(
                "h-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-orange" : "bg-border",
              )}
            />
            <span
              className={cn(
                "font-mono text-[0.65rem] tracking-[0.14em] uppercase transition-colors",
                i === step
                  ? "text-orange"
                  : i < step
                    ? "text-foreground"
                    : "text-muted-foreground/50",
              )}
            >
              {i < step ? <Check className="inline size-3" /> : `0${i + 1}`}{" "}
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="min-h-[360px]">
        {step === 0 ? (
          <Fieldset title="Let's start with you">
            <Text
              label="Full name"
              value={data.name}
              onChange={(v) => set("name", v)}
              placeholder="Your name"
              required
            />
            <Text
              label="Email"
              type="email"
              value={data.email}
              onChange={(v) => set("email", v)}
              placeholder="you@example.com"
              required
            />
            <Text
              label="WhatsApp number"
              value={data.whatsapp}
              onChange={(v) => set("whatsapp", v)}
              placeholder="10-digit number"
              required
            />
          </Fieldset>
        ) : null}

        {step === 1 ? (
          <Fieldset title="Where you study">
            <Pills
              label="Year of study"
              options={YEARS}
              value={data.year}
              onChange={(v) => set("year", v)}
              required
            />
            <Pills
              label="Branch"
              options={BRANCHES}
              value={data.branch}
              onChange={(v) => set("branch", v)}
              required
            />
            <Pills
              label="Section"
              options={SECTIONS}
              value={data.section}
              onChange={(v) => set("section", v)}
              required
            />
          </Fieldset>
        ) : null}

        {step === 2 ? (
          <Fieldset title="What you're into">
            <Checks
              label="Which domains interest you? (pick ~3)"
              options={DOMAINS}
              values={data.domains}
              onToggle={(v) => toggle("domains", v)}
              required
            />
            <Checks
              label="What are you focusing on right now?"
              options={FOCUSING}
              values={data.focusing}
              onToggle={(v) => toggle("focusing", v)}
            />
            <Checks
              label="What would you like from the community?"
              options={WANTS}
              values={data.wants}
              onToggle={(v) => toggle("wants", v)}
            />
          </Fieldset>
        ) : null}

        {step === 3 ? (
          <Fieldset title="A little about you">
            <Pills
              label="Worked on any projects before?"
              options={PROJECTS}
              value={data.projects}
              onChange={(v) => set("projects", v)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Text
                label="LinkedIn (optional)"
                value={data.linkedin}
                onChange={(v) => set("linkedin", v)}
                placeholder="Profile URL"
              />
              <Text
                label="GitHub (optional)"
                value={data.github}
                onChange={(v) => set("github", v)}
                placeholder="Profile URL"
              />
            </div>
            <Area
              label="Anything specific you want to learn?"
              value={data.learn}
              onChange={(v) => set("learn", v)}
              required
            />
            <Area
              label="Why do you want to join? (optional)"
              value={data.why}
              onChange={(v) => set("why", v)}
            />
          </Fieldset>
        ) : null}
      </div>

      {error ? (
        <p className="text-destructive mt-4 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setError(null);
            setStep(Math.max(0, step - 1));
          }}
          disabled={step === 0 || pending}
          className="rounded-full"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={next}
          disabled={pending}
          className="glow-pill rounded-full px-8"
        >
          {pending
            ? "Submitting…"
            : step === STEPS.length - 1
              ? "Submit & join"
              : "Continue"}
          {!pending ? <ArrowRight className="size-4" /> : null}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------- success -------------------------------- */

function Success({ name }: { name: string }) {
  const first = name.trim().split(/\s+/)[0] || "there";
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="bg-orange/10 text-orange mx-auto grid size-16 place-items-center rounded-2xl">
        <PartyPopper className="size-8" />
      </div>
      <h2 className="font-display mt-7 text-[clamp(2rem,5vw,3.25rem)] leading-[1] font-bold tracking-[-0.03em]">
        You&apos;re in, {first}.
      </h2>
      <p className="text-muted-foreground mx-auto mt-5 max-w-md text-lg leading-relaxed">
        Thanks for signing up. The last step is our Discord — that&apos;s where
        every session, resource and announcement lands. Jump in and say hi.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="glow-pill rounded-full px-8">
          <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
            Join the Discord
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link href={routes.events}>See upcoming events</Link>
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------- fields --------------------------------- */

function Fieldset({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h2>
      <div className="mt-7 space-y-6">{children}</div>
    </div>
  );
}

function Text({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-orange"> *</span> : null}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Area({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-orange"> *</span> : null}
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    </div>
  );
}

function Pills({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label>
        {label}
        {required ? <span className="text-orange"> *</span> : null}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              aria-pressed={active}
              className={cn(
                "focus-visible:ring-ring rounded-full border px-4 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:outline-none",
                active
                  ? "border-orange bg-orange/15 text-orange shadow-[0_0_18px_-6px_var(--orange)]"
                  : "border-border/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Checks({
  label,
  options,
  values,
  onToggle,
  required,
}: {
  label: string;
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label>
        {label}
        {required ? <span className="text-orange"> *</span> : null}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = values.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              aria-pressed={active}
              className={cn(
                "focus-visible:ring-ring inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all focus-visible:ring-2 focus-visible:outline-none",
                active
                  ? "border-orange bg-orange/15 text-orange"
                  : "border-border/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {active ? <Check className="size-3.5" /> : null}
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
