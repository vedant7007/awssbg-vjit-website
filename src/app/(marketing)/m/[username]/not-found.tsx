import Link from "next/link";

import { routes } from "@/lib/constants/routes";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

export default function MemberNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center pt-16">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <p className="eyebrow mb-3">No such member</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            We could not find that profile.
          </h1>
          <p className="text-muted-foreground mt-3">
            The username may be misspelled, or the member may not exist yet.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild>
              <Link href={routes.members}>Browse members</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={routes.home}>Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
