"use client";

import { GAMES, WHICH_SERVICE } from "./games";
import { McqGame } from "./McqGame";

const META = GAMES.find((g) => g.id === "which-service")!;

/** Scenario-based: match a real requirement to the right AWS service. */
export function WhichService({ onExit }: { onExit: () => void }) {
  return (
    <McqGame
      meta={META}
      pool={WHICH_SERVICE}
      onExit={onExit}
      eyebrow="Pick the right tool"
      promptLabel="The situation"
    />
  );
}
