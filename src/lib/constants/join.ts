/**
 * Options for the community Join form. Shared by the client form (renders the
 * pills/checkboxes) and the server action (validates submissions against these
 * exact values with zod). Keep this the single source of truth.
 */
export const JOIN_YEARS = ["1", "2", "3", "4"] as const;

export const JOIN_BRANCHES = [
  "CSE",
  "CSE AI&ML",
  "CSE DS",
  "IT",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
] as const;

export const JOIN_SECTIONS = ["A", "B", "C", "D"] as const;

export const JOIN_DOMAINS = [
  "AI / Generative AI",
  "Cloud Computing",
  "Web Development",
  "App Development",
  "Cybersecurity",
  "Data Science",
  "UI/UX Design",
  "Business & Management",
  "DevOps",
  "Game Development",
  "Blockchain",
] as const;

export const JOIN_FOCUSING = [
  "Learning new skills",
  "Building projects",
  "Hackathons",
  "Internships",
  "Certifications",
  "Freelancing",
  "Open Source",
  "Placements",
  "Networking",
  "Exploring domains",
] as const;

export const JOIN_WANTS = [
  "Learning resources",
  "Internship opportunities",
  "Networking",
  "Workshops",
  "Hackathons",
  "Project collaborations",
  "Career guidance",
  "Certification guidance",
  "Tech discussions",
  "Community activities",
] as const;

export const JOIN_PROJECTS = ["Yes", "No", "Currently Working"] as const;

/** Hidden anti-bot field name; a real user never fills it. */
export const JOIN_HONEYPOT_FIELD = "company";
/** Field carrying the client render time (ms) for the timing trap. */
export const JOIN_RENDERED_AT_FIELD = "renderedAt";
/** Reject submissions faster than this — no human fills the form this quickly. */
export const JOIN_MIN_FILL_MS = 2500;
