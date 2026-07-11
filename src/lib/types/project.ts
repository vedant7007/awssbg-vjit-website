import { z } from "zod";
import type { Timestamp, Serialized } from "./firestore";

export const projectFormSchema = z.object({
  slug: z
    .string()
    .min(2, "At least 2 characters")
    .max(50, "At most 50 characters")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/,
      "Lowercase letters, numbers, and hyphens only",
    ),
  title: z.string().min(2, "Required").max(80),
  tagline: z.string().min(5, "Required").max(120),
  description: z.string().min(10, "Required"),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  stack: z.array(z.string().min(1)).max(20),
  contributors: z.array(z.string().min(1)).max(20),
  repoUrl: z.string().url("Must be a valid URL").nullable().or(z.literal("")),
  liveUrl: z.string().url("Must be a valid URL").nullable().or(z.literal("")),
  architectureDiagram: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  featured: z.boolean(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string | null;
  stack: string[];
  contributors: string[]; // member UIDs
  repoUrl: string | null;
  liveUrl: string | null;
  architectureDiagram: string | null;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PopulatedContributor = {
  id: string;
  displayName: string;
  photoURL: string | null;
  github?: string | undefined;
};

export type SerializedProjectWithContributors = Serialized<Project> & {
  populatedContributors?: PopulatedContributor[];
};
