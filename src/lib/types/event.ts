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
