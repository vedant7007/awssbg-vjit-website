import type { Metadata } from "next";
import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";

import { safe } from "@/lib/utils/safe";
import {
  listApplications,
  type Application,
} from "@/lib/firestore/applications";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Applications | Admin" };
export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function waLink(whatsapp: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export default async function AdminApplicationsPage() {
  const apps = await safe(listApplications(), [], "admin:applications");

  return (
    <PageShell
      eyebrow="Community"
      title="Applications"
      description={`${apps.length} ${
        apps.length === 1 ? "submission" : "submissions"
      } from the website join form, newest first.`}
    >
      {apps.length === 0 ? (
        <p className="text-muted-foreground">
          No applications yet. Submissions from the Join form appear here.
        </p>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => (
            <ApplicationCard key={a.id} app={a} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function ApplicationCard({ app }: { app: Application }) {
  return (
    <article className="bg-card rounded-sm border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">
            {app.name || "(no name)"}
          </h3>
          <p className="text-muted-foreground mt-0.5 font-mono text-xs">
            Year {app.year || "?"} · {app.branch || "?"} · Sec{" "}
            {app.section || "?"} · Projects: {app.projects || "?"}
          </p>
        </div>
        <time className="text-muted-foreground shrink-0 font-mono text-xs">
          {formatDate(app.createdAt)}
        </time>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {app.email ? (
          <a
            href={`mailto:${app.email}`}
            className="text-foreground/80 hover:text-orange inline-flex items-center gap-1.5"
          >
            <Mail className="size-3.5" aria-hidden />
            {app.email}
          </a>
        ) : null}
        {app.whatsapp ? (
          <a
            href={waLink(app.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-orange inline-flex items-center gap-1.5"
          >
            <MessageCircle className="size-3.5" aria-hidden />
            {app.whatsapp}
          </a>
        ) : null}
        {app.linkedin ? (
          <a
            href={app.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-orange inline-flex items-center gap-1.5"
          >
            <Linkedin className="size-3.5" aria-hidden />
            LinkedIn
          </a>
        ) : null}
        {app.github ? (
          <a
            href={app.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-orange inline-flex items-center gap-1.5"
          >
            <Github className="size-3.5" aria-hidden />
            GitHub
          </a>
        ) : null}
      </div>

      {app.domains.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {app.domains.map((d) => (
            <Badge key={d} variant="secondary" className="font-normal">
              {d}
            </Badge>
          ))}
        </div>
      ) : null}

      {(app.focusing.length > 0 ||
        app.wants.length > 0 ||
        app.learn ||
        app.why) && (
        <details className="group mt-4">
          <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium tracking-wide uppercase marker:content-['']">
            <span className="group-open:hidden">Show more ▾</span>
            <span className="hidden group-open:inline">Show less ▴</span>
          </summary>
          <dl className="mt-3 space-y-3 text-sm">
            {app.focusing.length > 0 ? (
              <Field label="Focusing on" value={app.focusing.join(", ")} />
            ) : null}
            {app.wants.length > 0 ? (
              <Field
                label="Wants from community"
                value={app.wants.join(", ")}
              />
            ) : null}
            {app.learn ? (
              <Field label="Wants to learn" value={app.learn} />
            ) : null}
            {app.why ? <Field label="Why join" value={app.why} /> : null}
          </dl>
        </details>
      )}
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground font-mono text-[0.7rem] tracking-wide uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 leading-relaxed">{value}</dd>
    </div>
  );
}
