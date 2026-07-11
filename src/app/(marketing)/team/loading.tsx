import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export default function TeamLoading() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-44 md:pb-24">
        <div className="from-orange/5 to-purple/5 pointer-events-none absolute top-1/4 left-1/2 -z-20 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr opacity-40 blur-[100px] filter" />
        <div
          className="grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-30"
          aria-hidden
        />
        <Container>
          <div className="bg-muted mb-6 h-4 w-20 animate-pulse rounded" />
          <div className="bg-muted h-16 w-3/4 max-w-lg animate-pulse rounded" />
          <div className="bg-muted mt-6 h-6 w-1/2 max-w-md animate-pulse rounded" />
        </Container>
      </section>

      {/* Profile Cards Grid Skeleton */}
      <Section className="!pt-8 pb-32">
        <Container>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border-border relative flex aspect-[0.75] max-h-[480px] animate-pulse flex-col justify-between overflow-hidden rounded-sm border p-6"
              >
                {/* Background glow mock */}
                <div className="from-muted/20 to-muted/20 absolute inset-0 bg-gradient-to-tr via-transparent opacity-50" />

                {/* Avatar Mock */}
                <div className="relative z-10 flex flex-1 flex-col items-center justify-center pt-8">
                  <div className="bg-muted border-border mb-6 size-28 rounded-full border-4" />

                  {/* Info Mock */}
                  <div className="bg-muted mb-2 h-5 w-2/3 rounded" />
                  <div className="bg-muted h-3 w-1/3 rounded" />
                </div>

                {/* Bottom glass panel mock */}
                <div className="bg-muted/30 border-border/40 relative z-10 mt-auto flex items-center justify-between rounded-sm border p-4">
                  <div className="space-y-2">
                    <div className="bg-muted h-3 w-16 rounded" />
                    <div className="bg-muted h-2 w-12 rounded" />
                  </div>
                  <div className="bg-muted h-8 w-20 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
