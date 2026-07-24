"use client";

import { GAMES, SERVICE_MATCH } from "./games";
import { McqGame } from "./McqGame";

const META = GAMES.find((g) => g.id === "service-match")!;

/** Timed round: read the description, name the service before the clock runs out. */
export function ServiceMatch({ onExit }: { onExit: () => void }) {
  return (
    <McqGame
      meta={META}
      pool={SERVICE_MATCH}
      onExit={onExit}
      eyebrow="Name the service"
      promptLabel="This service is…"
      timePerQuestion={10}
    />
  );
}
