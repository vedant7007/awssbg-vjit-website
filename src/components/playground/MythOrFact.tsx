"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { GAMES, MYTH_OR_FACT, type MythQuestion, shuffle } from "./games";
import { useBestScore } from "./useBestScore";
import { CORRECT, ExitButton, GamePanel, Stat, WRONG } from "./shared";

const META = GAMES.find((g) => g.id === "myth-or-fact")!;

/**
 * Endless true/false run. Every answer flips a card to reveal why it's right or
 * wrong; a correct call extends the streak, a wrong one resets it. The best
 * streak is what gets persisted.
 */
export function MythOrFact({ onExit }: { onExit: () => void }) {
  const { best, submit } = useBestScore(META.bestKey);

  const [deck, setDeck] = React.useState<MythQuestion[]>(() =>
    shuffle(MYTH_OR_FACT),
  );
  const [index, setIndex] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [answered, setAnswered] = React.useState(0);
  const [guess, setGuess] = React.useState<boolean | null>(null);

  const current = deck[index];
  const locked = guess !== null;
  const correct = current !== undefined && guess === current.isFact;

  function answer(choice: boolean) {
    if (locked || !current) return;
    setGuess(choice);
    setAnswered((n) => n + 1);
    if (choice === current.isFact) {
      const next = streak + 1;
      setStreak(next);
      submit(next);
    } else {
      setStreak(0);
    }
  }

  function next() {
    setGuess(null);
    setIndex((i) => {
      if (i + 1 >= deck.length) {
        setDeck(shuffle(MYTH_OR_FACT));
        return 0;
      }
      return i + 1;
    });
  }

  if (!current) return null;

  return (
    <GamePanel accent={META.accent}>
      <div className="flex items-center justify-between gap-4">
        <ExitButton onExit={onExit} />
        <div className="flex items-center gap-6">
          <Stat label="Streak" value={streak} accent />
          <Stat label="Best streak" value={best} />
        </div>
      </div>

      <div className="mt-10 text-center sm:mt-14">
        <p
          className="font-mono text-[0.65rem] tracking-[0.2em] uppercase"
          style={{ color: META.accent }}
        >
          Myth or fact?
        </p>
        <blockquote className="font-display mx-auto mt-5 max-w-2xl text-2xl leading-snug font-bold tracking-[-0.01em] text-balance sm:text-3xl lg:text-[2.25rem]">
          “{current.statement}”
        </blockquote>
      </div>

      <div className="mx-auto mt-9 grid max-w-lg grid-cols-2 gap-3">
        <VerdictButton
          label="Myth"
          onClick={() => answer(false)}
          locked={locked}
          isAnswer={current.isFact === false}
          picked={guess === false}
        />
        <VerdictButton
          label="Fact"
          onClick={() => answer(true)}
          locked={locked}
          isAnswer={current.isFact === true}
          picked={guess === true}
        />
      </div>

      {/* Reveal drawer: verdict + the one-line reason. */}
      <div
        className={cn(
          "mx-auto mt-7 max-w-lg overflow-hidden transition-all duration-300",
          locked ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div
          className="rounded-md p-5 ring-1"
          style={{
            borderColor: correct ? CORRECT : WRONG,
            boxShadow: `inset 0 0 0 1px ${correct ? CORRECT : WRONG}`,
            backgroundColor: `color-mix(in oklab, ${correct ? CORRECT : WRONG} 8%, transparent)`,
          }}
        >
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.15em] uppercase">
            {correct ? (
              <Check className="size-4" style={{ color: CORRECT }} />
            ) : (
              <X className="size-4" style={{ color: WRONG }} />
            )}
            <span>
              {correct ? "Correct — " : "Nope — it's a "}
              <span className="font-semibold">
                {current.isFact ? "Fact" : "Myth"}
              </span>
            </span>
          </p>
          <p className="text-foreground/90 mt-3 text-sm leading-relaxed">
            {current.reason}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-muted-foreground font-mono text-xs tabular-nums">
            {answered} answered
          </p>
          <Button onClick={next} className="rounded-full">
            Next
          </Button>
        </div>
      </div>
    </GamePanel>
  );
}

function VerdictButton({
  label,
  onClick,
  locked,
  isAnswer,
  picked,
}: {
  label: string;
  onClick: () => void;
  locked: boolean;
  isAnswer: boolean;
  picked: boolean;
}) {
  // After locking, the true verdict glows green; a wrong pick glows red.
  const tint = !locked
    ? undefined
    : isAnswer
      ? CORRECT
      : picked
        ? WRONG
        : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={cn(
        "font-display focus-visible:ring-ring rounded-md py-6 text-lg font-bold ring-1 transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none",
        !locked && "ring-border/60 hover:bg-foreground/[0.03] cursor-pointer",
        locked && !tint && "ring-border/40 opacity-40",
        locked && "cursor-default",
      )}
      style={
        tint
          ? {
              borderColor: tint,
              boxShadow: `inset 0 0 0 1px ${tint}`,
              backgroundColor: `color-mix(in oklab, ${tint} 12%, transparent)`,
              color: tint,
            }
          : undefined
      }
    >
      {label}
    </button>
  );
}
