import { redirect } from "next/navigation";

import { routes } from "@/lib/constants/routes";

/** Tasks now live in one place — the console board shows admins every team's
 * work inline, so this route just forwards there. */
export default function AdminTasksPage() {
  redirect(routes.consoleTasks);
}
