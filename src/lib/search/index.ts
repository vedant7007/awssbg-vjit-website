import Fuse, { type IFuseOptions } from "fuse.js";

// ---------------------------------------------------------------------------
// Shared types — must stay in sync with the /api/search route payload shape.
// ---------------------------------------------------------------------------

export type SearchMember = {
  type: "member";
  id: string;
  title: string; // displayName
  subtitle: string; // @username
  url: string; // /m/[username]
  meta: string; // role
  avatarUrl: string | null;
  team: string | null;
};

export type SearchEvent = {
  type: "event";
  id: string;
  title: string; // event title
  subtitle: string; // tagline
  url: string; // /events/[slug]
  meta: string; // status
  category: string;
  startAt: string | null;
};

export type SearchProject = {
  type: "project";
  id: string;
  title: string; // project title
  subtitle: string; // tagline
  url: string; // /projects/[slug]
  meta: string | null;
  stack: string[];
  featured: boolean;
};

export type SearchItem = SearchMember | SearchEvent | SearchProject;

export type SearchData = {
  members: SearchMember[];
  events: SearchEvent[];
  projects: SearchProject[];
};

export type GroupedResults = {
  members: SearchItem[];
  events: SearchItem[];
  projects: SearchItem[];
};

// ---------------------------------------------------------------------------
// Fuse.js configuration
// ---------------------------------------------------------------------------

const FUSE_OPTIONS: IFuseOptions<SearchItem> = {
  // Keys searched and their relative weights
  keys: [
    { name: "title", weight: 3 },
    { name: "subtitle", weight: 2 },
    { name: "meta", weight: 1 },
  ],
  // Fuzzy threshold: 0 = exact, 1 = match anything. 0.35 feels like Raycast.
  threshold: 0.35,
  // Return matches for highlighting (unused in phase 1 but useful later)
  includeMatches: false,
  // Minimum characters to match
  minMatchCharLength: 1,
  // Allow searching entire string, not just prefix
  ignoreLocation: true,
  // Score results — lower is better
  shouldSort: true,
};

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/**
 * Build a Fuse.js index from the flat search data returned by /api/search.
 * Merge all three arrays into a single collection for cross-type search.
 */
export function buildIndex(data: SearchData): Fuse<SearchItem> {
  const collection: SearchItem[] = [
    ...data.members,
    ...data.events,
    ...data.projects,
  ];
  return new Fuse(collection, FUSE_OPTIONS);
}

/**
 * Run a fuzzy search and group results by type.
 * Returns an empty group object when query is blank.
 */
export function search(fuse: Fuse<SearchItem>, query: string): GroupedResults {
  const empty: GroupedResults = { members: [], events: [], projects: [] };

  const q = query.trim();
  if (!q) return empty;

  const results = fuse.search(q).map((r) => r.item);

  return {
    members: results.filter((r) => r.type === "member"),
    events: results.filter((r) => r.type === "event"),
    projects: results.filter((r) => r.type === "project"),
  };
}

/**
 * When query is empty, show a "browse all" view ordered by type.
 * Capped at a small number so the list doesn't feel overwhelming.
 */
export function browseAll(data: SearchData, limit = 5): GroupedResults {
  return {
    members: (data.members as SearchItem[]).slice(0, limit),
    events: (data.events as SearchItem[]).slice(0, limit),
    projects: (data.projects as SearchItem[]).slice(0, limit),
  };
}
