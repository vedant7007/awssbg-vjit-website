import { z } from "zod";
import type { Timestamp } from "./firestore";

export const MEMBER_ROLES = ["core", "lead", "member", "alumni"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export type MemberSocials = {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
};

export type Member = {
  id: string; // Firebase Auth UID
  username: string; // unique, lowercase, used in /m/[username]
  displayName: string;
  email: string;
  photoURL: string | null;
  role: MemberRole;
  team: string | null;
  cohortYear: number;
  batchYear: number;
  branch: string;
  bio: string; // 280 char max
  skills: string[];
  socials: MemberSocials;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/**
 * Form schema shared by the member profile form and the admin members CRUD.
 * Server timestamps and the UID are managed outside the form, so they are
 * intentionally absent here.
 */
export const memberFormSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "At most 30 characters")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/,
      "Lowercase letters, numbers, and single hyphens only",
    ),
  displayName: z.string().min(2, "Required").max(80),
  email: z.string().email("Enter a valid email"),
  photoURL: z.string().url("Must be a valid URL").nullable(),
  role: z.enum(MEMBER_ROLES),
  team: z.string().max(40).nullable(),
  cohortYear: z.coerce.number().int().min(2015).max(2100),
  batchYear: z.coerce.number().int().min(2015).max(2100),
  branch: z.string().min(1, "Required").max(40),
  bio: z.string().max(280, "Keep it under 280 characters"),
  skills: z.array(z.string().min(1)).max(24),
  socials: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
  }),
  isPublic: z.boolean(),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

/** Fields a member may edit on their own doc. Role/team stay admin-controlled. */
export const SELF_EDITABLE_MEMBER_FIELDS = [
  "username",
  "displayName",
  "photoURL",
  "bio",
  "skills",
  "socials",
  "branch",
  "batchYear",
  "isPublic",
] as const;
