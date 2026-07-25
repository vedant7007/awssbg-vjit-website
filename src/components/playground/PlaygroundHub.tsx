"use client";

import * as React from "react";
import { Play, Trophy } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/motion/Reveal";
import { type GameId, type GameMeta, GAMES } from "./games";
import { useBestScore } from "./useBestScore";
import { ServiceMatch } from "./ServiceMatch";
import { MythOrFact } from "./MythOrFact";
import { WhichService } from "./WhichService";
import { CloudCatch } from "./CloudCatch";
import { MemoryMatch } from "./MemoryMatch";
import { Cloudle } from "./Cloudle";

/**
 * The arcade: a grid of game cards, one of which launches into a live panel
 * that replaces the grid. Each card carries its own accent, so the six games
 * read as six distinct machines rather than one repeated template.
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
          {active === "cloud-catch" ? <CloudCatch onExit={exit} /> : null}
          {active === "memory-match" ? <MemoryMatch onExit={exit} /> : null}
          {active === "cloudle" ? <Cloudle onExit={exit} /> : null}
        </div>
      ) : (
        <div>
          <Reveal>
            <div className="border-border/60 flex items-end justify-between gap-4 border-b pb-5">
              <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
                The arcade
              </p>
              <p className="text-muted-foreground font-mono text-xs tabular-nums">
                {GAMES.length} playable
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((game, i) => (
              <Reveal key={game.id} delay={Math.min(i, 3) * 0.06}>
                <GameCard game={game} onPlay={() => setActive(game.id)} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatBest(game: GameMeta, best: number): string {
  if (!game.lowerIsBetter) return String(best);
  const m = Math.floor(best / 60);
  const s = best % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * One machine in the arcade. The accent drives the icon tile, the hairline and
 * the wash that ignites on hover, so each card has its own identity while the
 * type stays in the site's editorial voice.
 */
function GameCard({ game, onPlay }: { game: GameMeta; onPlay: () => void }) {
  const { best, ready } = useBestScore(game.bestKey);
  const Icon = game.icon;
  const hasBest = ready && best > 0;

  return (
    <button
      type="button"
      onClick={onPlay}
      style={{ "--accent": game.accent } as React.CSSProperties}
      className={cn(
        "group ring-border/60 focus-visible:ring-ring relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl p-6 text-left ring-1 transition-all duration-300 focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none sm:p-7",
        "hover:-translate-y-1 hover:ring-[color-mix(in_oklab,var(--accent)_55%,transparent)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      {/* accent wash, lit on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 85% at 50% 0%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 68%)",
        }}
      />
      {/* top hairline in the accent */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-40 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: game.accent }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{
            backgroundColor: `color-mix(in oklab, ${game.accent} 14%, transparent)`,
            color: game.accent,
          }}
        >
          <Icon className="size-5" aria-hidden />
        </span>

        {hasBest ? (
          <span className="text-muted-foreground inline-flex items-center gap-1.5 font-mono text-[0.6rem] tracking-wide uppercase tabular-nums">
            <Trophy className="size-3" aria-hidden />
            {game.bestLabel} {formatBest(game, best)}
          </span>
        ) : null}
      </div>

      <p
        className="relative mt-6 font-mono text-[0.62rem] tracking-[0.18em] uppercase"
        style={{ color: game.accent }}
      >
        {game.teaches}
      </p>
      <h3 className="font-display relative mt-2 text-2xl font-bold tracking-[-0.02em]">
        {game.title}
      </h3>
      <p className="text-muted-foreground relative mt-3 text-sm leading-relaxed">
        {game.blurb}
      </p>

      <div className="relative mt-6 flex flex-wrap items-center gap-2">
        <Chip>{game.difficulty}</Chip>
        <Chip>{game.duration}</Chip>
      </div>

      <span
        className="relative mt-6 inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] uppercase"
        style={{ color: game.accent }}
      >
        <Play className="size-3.5 fill-current" aria-hidden />
        Play
        <span className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none">
          →
        </span>
      </span>
    </button>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border/70 text-muted-foreground rounded-full border px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.1em] uppercase">
      {children}
    </span>
  );
}
