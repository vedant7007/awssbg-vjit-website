import { z } from "zod";
import type { Timestamp } from "./firestore";

export const ROADMAP_STATUSES = [
  "proposed",
  "planned",
  "in-progress",
  "shipped",
  "cancelled",
] as const;
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];

export const ROADMAP_CATEGORIES = [
  "event",
  "workshop",
  "project",
  "initiative",
] as const;
export type RoadmapCategory = (typeof ROADMAP_CATEGORIES)[number];

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  quarter: string; // e.g. "2026-Q3"
  status: RoadmapStatus;
  category: RoadmapCategory;
  voteCount: number; // denormalized, updated via transaction
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export const roadmapItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  quarter: z.string().min(1).max(20),
  status: z.enum(ROADMAP_STATUSES),
  category: z.enum(ROADMAP_CATEGORIES),
});

export type RoadmapItemFormValues = z.infer<typeof roadmapItemSchema>;

export type RoadmapVote = {
  id: string; // `${itemId}_${userId}`
  itemId: string;
  userId: string;
  createdAt: Timestamp;
};

export type AdminUser = {
  id: string; // Firebase Auth UID
  email: string;
  grantedBy: string;
  grantedAt: Timestamp;
};
