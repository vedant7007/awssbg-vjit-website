import { format, formatDistanceToNowStrict, isValid } from "date-fns";

/**
 * Firestore timestamps arrive in a few shapes depending on SDK context
 * (client Timestamp, admin Timestamp, or a plain serialized object). This
 * narrows all of them to a Date without importing firebase into shared code.
 */
type TimestampLike =
  | Date
  | { toDate: () => Date }
  | { seconds: number; nanoseconds?: number }
  | string
  | number;

export function toDate(value: TimestampLike | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isValid(d) ? d : null;
  }
  if ("toDate" in value && typeof value.toDate === "function") {
    const d = value.toDate();
    return isValid(d) ? d : null;
  }
  if ("seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  return null;
}

export function formatDate(
  value: TimestampLike | null | undefined,
  pattern = "d MMM yyyy",
): string {
  const d = toDate(value);
  return d ? format(d, pattern) : "";
}

export function formatDateTime(
  value: TimestampLike | null | undefined,
): string {
  const d = toDate(value);
  return d ? format(d, "d MMM yyyy, h:mm a") : "";
}

export function formatRelative(
  value: TimestampLike | null | undefined,
): string {
  const d = toDate(value);
  return d ? formatDistanceToNowStrict(d, { addSuffix: true }) : "";
}

/** First name only, for compact greetings. */
export function firstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}

/** Two-letter initials for avatar fallbacks. */
export function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}
