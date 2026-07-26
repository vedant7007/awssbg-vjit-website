import { z } from "zod";

import {
  JOIN_YEARS,
  JOIN_BRANCHES,
  JOIN_SECTIONS,
  JOIN_DOMAINS,
  JOIN_FOCUSING,
  JOIN_WANTS,
  JOIN_PROJECTS,
} from "@/lib/constants/join";

/** Build a Zod enum from one of the readonly option tuples. */
const asEnum = (arr: readonly string[]) =>
  z.enum(arr as unknown as [string, ...string[]]);

/**
 * The server-side contract for a Join submission: length caps on free text,
 * size caps on the multi-selects, and allow-listed values for every option
 * field. Lives in its own module (no `"use server"`) so it can be unit-tested.
 */
export const joinSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  whatsapp: z
    .string()
    .trim()
    .min(7)
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "invalid phone"),
  year: asEnum(JOIN_YEARS),
  branch: asEnum(JOIN_BRANCHES),
  section: asEnum(JOIN_SECTIONS),
  domains: asEnum(JOIN_DOMAINS).array().min(1).max(JOIN_DOMAINS.length),
  focusing: asEnum(JOIN_FOCUSING).array().max(JOIN_FOCUSING.length),
  wants: asEnum(JOIN_WANTS).array().max(JOIN_WANTS.length),
  projects: asEnum(JOIN_PROJECTS),
  linkedin: z.string().trim().max(200),
  github: z.string().trim().max(200),
  learn: z.string().trim().min(1).max(1000),
  why: z.string().trim().max(1000),
});

export type JoinInput = z.infer<typeof joinSchema>;
