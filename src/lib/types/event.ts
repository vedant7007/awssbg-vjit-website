import { z } from "zod";
import type { Timestamp } from "./firestore";

export const EVENT_CATEGORIES = [
  "workshop",
  "hackathon",
  "talk",
  "meetup",
  "competition",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_STATUSES = ["upcoming", "live", "past"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export type Event = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string; // markdown
  coverImage: string; // Firebase Storage path
  gallery: string[];
  category: EventCategory;
  status: EventStatus;
  startAt: Timestamp;
  endAt: Timestamp;
  venue: string;
  capacity: number | null; // null = unlimited
  registrationOpen: boolean;
  registrationDeadline: Timestamp | null;
  externalLink: string | null;
  outcomes: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export const eventFormSchema = z.object({
  slug: z
    .string()
    .min(3, "At least 3 characters")
    .max(50, "At most 50 characters")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])$/,
      "Lowercase letters, numbers, and single hyphens only",
    ),
  title: z.string().min(2, "Required").max(100),
  tagline: z.string().min(2, "Required").max(200),
  description: z.string().min(1, "Required"),
  coverImage: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  gallery: z.array(z.string().url("Must be a valid URL")).max(10),
  category: z.enum(EVENT_CATEGORIES),
  status: z.enum(EVENT_STATUSES),
  startAt: z.string().min(1, "Required"),
  endAt: z.string().min(1, "Required"),
  venue: z.string().min(1, "Required").max(100),
  capacity: z.coerce.number().int().min(1).nullable().or(z.nan()),
  registrationOpen: z.boolean(),
  registrationDeadline: z.string().nullable().or(z.literal("")),
  externalLink: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  outcomes: z.array(z.string().min(1)).max(10),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
