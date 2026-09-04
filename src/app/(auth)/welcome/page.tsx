import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { getViewer } from "@/lib/auth/viewer";
import { routes } from "@/lib/constants/routes";
import { WelcomeClient } from "./WelcomeClient";

export const metadata: Metadata = { title: "Set your password | AWS SBG VJIT" };
export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  await requireAuth(routes.welcome);
  const viewer = await getViewer();
  if (!viewer) redirect(routes.signin);
  // Already set their own password — nothing to do here.
  if (!viewer.mustChangePassword) redirect(routes.console);

  return <WelcomeClient name={viewer.name} />;
}
