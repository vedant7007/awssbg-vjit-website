"use client";

import * as React from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/motion/Reveal";
import { type GameId, type GameMeta, GAMES } from "./games";
import { useBestScore } from "./useBestScore";
import { ServiceMatch } from "./ServiceMatch";
import { MythOrFact } from "./MythOrFact";
import { WhichService } from "./WhichService";

/**
 * The arcade: a grid of game cards, one of which can be launched into a live
 * panel that replaces the grid. Selecting a game is the only interaction — the
 * "coming soon" card is deliberately not a button, so nothing clickable is dead.
 */
export function PlaygroundHub() {
  const [active, setActive] = React.useState<GameId | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const exit = React.useCallback(() => setActive(null), []);

  // Bring the launched game into view without yanking the whole page.
  React.useEffect(() => {
    if (active && panelRef.current) {
      panelRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [active]);

  return (
    <div ref={panelRef} className="scroll-mt-28">
      {active ? (
        <div>
          {active === "service-match" ? <ServiceMatch onExit={exit} /> : null}
          {active === "myth-or-fact" ? <MythOrFact onExit={exit} /> : null}
          {active === "which-service" ? <WhichService onExit={exit} /> : null}
        </div>
      ) : (
        <div>
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
                The arcade
              </p>
              <p className="text-muted-foreground font-mono text-xs tabular-nums">
                {GAMES.length} playable
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game, i) => (
              <Reveal key={game.id} delay={i * 0.05}>
                <GameCard game={game} onPlay={() => setActive(game.id)} />
              </Reveal>
            ))}
            <Reveal delay={GAMES.length * 0.05}>
              <SoonCard />
            </Reveal>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, onPlay }: { game: GameMeta; onPlay: () => void }) {
  const { best, ready } = useBestScore(game.bestKey);

  return (
    <button
      type="button"
      onClick={onPlay}
      style={{ "--accent": game.accent } as React.CSSProperties}
      className="group ring-border/60 focus-visible:ring-ring relative flex h-full cursor-pointer flex-col p-7 text-left ring-1 transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(110% 90% at 50% 0%, color-mix(in oklab, var(--accent) 12%, transparent), transparent 70%)",
        }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <span
          className="font-mono text-[0.65rem] tracking-[0.18em] uppercase"
          style={{ color: game.accent }}
        >
          {game.teaches}
        </span>
        {ready && best > 0 ? (
          <span className="text-muted-foreground font-mono text-[0.6rem] tracking-wide uppercase tabular-nums">
            {game.bestLabel}: {best}
          </span>
        ) : null}
      </div>

      <h3 className="font-display relative mt-8 text-2xl font-bold tracking-tight">
        {game.title}
      </h3>
      <p className="text-muted-foreground relative mt-3 text-sm leading-relaxed">
        {game.blurb}
      </p>

      <span
        className="relative mt-6 inline-flex items-center gap-2 font-mono text-xs tracking-[0.12em] uppercase transition-colors"
        style={{ color: game.accent }}
      >
        <Play className="size-3.5 fill-current" />
        Play
        <span className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </button>
  );
}

function SoonCard() {
  return (
    <div
      className={cn(
        "ring-border/60 relative flex h-full flex-col p-7 ring-1",
        "opacity-70",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground font-mono text-[0.65rem] tracking-[0.18em] uppercase">
          Cost &amp; scale
        </span>
        <span className="text-muted-foreground border-border/70 rounded-full border px-2.5 py-1 font-mono text-[0.6rem] tracking-wide uppercase">
          Coming soon
        </span>
      </div>
      <h3 className="font-display mt-8 text-2xl font-bold tracking-tight">
        Cloud Tycoon
      </h3>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        Run a startup on a budget: traffic spikes, you pick the architecture,
        the bill decides whether you survive the quarter. In the workshop, still
        being built into a game.
      </p>
    </div>
  );
}
