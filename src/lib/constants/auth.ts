/**
 * Members log in with their handle (username), not an email. Firebase's
 * Email/Password provider needs an email, so we map `handle` → a synthetic
 * address on this internal domain. It never receives mail — it's just the
 * stable key Firebase Auth stores the credential under.
 *
 * The provisioning script and the login form MUST agree on this value.
 */
export const MEMBER_EMAIL_DOMAIN = "members.awssbgvjit.app";

/** handle → the synthetic email Firebase Auth stores the account under. */
export function handleToEmail(handle: string): string {
  return `${handle.trim().toLowerCase()}@${MEMBER_EMAIL_DOMAIN}`;
}
