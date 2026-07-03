/** Convert an arbitrary string into a url-safe, lowercase slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Username rules: lowercase, alphanumeric plus single hyphens, 3-30 chars. */
export function normalizeUsername(input: string): string {
  return slugify(input).slice(0, 30);
}

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;

export function isValidUsername(value: string): boolean {
  return USERNAME_PATTERN.test(value);
}
