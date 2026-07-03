import type { Timestamp } from "./firestore";

export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  stack: string[];
  contributors: string[]; // member UIDs
  repoUrl: string | null;
  liveUrl: string | null;
  architectureDiagram: string | null;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
