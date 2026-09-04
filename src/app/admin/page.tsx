import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";

/** The admin dashboard is now the (role-aware) console overview — one home for
 * everyone. Anything that still links to /admin lands there. */
export default function AdminHomePage() {
  redirect(routes.console);
}
