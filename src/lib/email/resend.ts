import "server-only";
import { Resend } from "resend";

import { logger } from "@/lib/utils/logger";

/*
 * Resend transactional email client (server only).
 *
 * The API key is read from the RESEND_API_KEY env var, never hardcoded.
 * Set it in .env.local (and in Vercel project settings) with your real key,
 * e.g. RESEND_API_KEY=re_your_real_key_here. The Resend dashboard shows the
 * key exactly once when you create it.
 */
const apiKey = process.env.RESEND_API_KEY;

export const resend = new Resend(apiKey);

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    cid?: string;
  }[];
};

/**
 * Send a transactional email. Returns the Resend message id on success or
 * null on failure (logged, not thrown) so callers can degrade gracefully.
 */
export async function sendEmail(args: SendEmailArgs): Promise<string | null> {
  if (!apiKey) {
    logger.warn("RESEND_API_KEY is not set; skipping email send", args.subject);
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: args.to,
    subject: args.subject,
    html: args.html,
    ...(args.replyTo ? { replyTo: args.replyTo } : {}),
    ...(args.attachments ? { attachments: args.attachments } : {}),
  });

  if (error) {
    logger.error("Resend send failed", error);
    return null;
  }
  return data?.id ?? null;
}

/**
 * Minimal "Hello World" send matching the Resend quickstart. Handy for a one-off
 * connectivity check once your real RESEND_API_KEY is in place:
 *   await sendHelloWorld("vedantidlgave16@gmail.com");
 */
export async function sendHelloWorld(to: string): Promise<string | null> {
  return sendEmail({
    to,
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });
}
