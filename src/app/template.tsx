/**
 * Re-mounts on every navigation, giving the incoming page a subtle 200ms
 * opacity fade-in (opacity only — no transform — so fixed elements like the nav
 * aren't reparented). Pairs with the cloud transition reveal.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
