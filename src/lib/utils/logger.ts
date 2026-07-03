/*
 * Dev-only console wrapper. Use this instead of console.* anywhere in the app.
 * info/warn are silenced in production; error always surfaces so real failures
 * are not swallowed. eslint no-console is disabled for this file only.
 */
const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info: (...args: unknown[]): void => {
    if (isDev) console.info("[info]", ...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn("[warn]", ...args);
  },
  error: (...args: unknown[]): void => {
    console.error("[error]", ...args);
  },
};
