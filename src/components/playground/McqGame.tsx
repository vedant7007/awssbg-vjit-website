"use client";

import * as React from "react";
import { RotateCcw, Timer } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { type GameMeta, type McqQuestion, sample, shuffle } from "./games";
import { useBestScore } from "./useBestScore";
import {
  ExitButton,
  GamePanel,
  OptionButton,
  type OptionState,
  ProgressBar,
  Stat,
  WRONG,
} from "./shared";

type RoundItem = { q: McqQuestion; options: string[] };

function buildRound(pool: readonly McqQuestion[], n: number): RoundItem[] {
  return sample(pool, n).map((q) => ({ q, options: shuffle(q.options) }));
}

/**
 * The engine behind both Service Match and Which Service?. They share a shape —
 * prompt, four options, one right answer — and differ only in framing and an
 * optional per-question timer, passed as `timePerQuestion`.
 */
export function McqGame({
  meta,
  pool,
  onExit,
  eyebrow,
  promptLabel,
  timePerQuestion,
}: {
  meta: GameMeta;
  pool: readonly McqQuestion[];
  onExit: () => void;
  eyebrow: string;
  promptLabel: string;
  timePerQuestion?: number;
}) {
  const timed = typeof timePerQuestion === "number";
  const { best, submit } = useBestScore(meta.bestKey);

  const [round, setRound] = React.useState<RoundItem[]>(() =>
    buildRound(pool, meta.rounds),
  );
  const [index, setIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [locked, setLocked] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(timePerQuestion ?? 0);

  const current = round[index];
  const total = round.length;

  const lock = React.useCallback(
    (choice: string | null) => {
      setLocked((wasLocked) => {
        if (wasLocked || !current) return wasLocked;
        setSelected(choice);
        if (choice !== null && choice === current.q.answer) {
          setScore((s) => s + 1);
        }
        return true;
      });
    },
    [current],
  );

  // Per-question countdown. Runs only while a timed question is unanswered;
  // hitting zero locks the question with no selection, revealing the answer.
  React.useEffect(() => {
    if (!timed || locked || done) return;
    setTimeLeft(timePerQuestion ?? 0);
    const started = Date.now();
    const id = window.setInterval(() => {
      const remaining = (timePerQuestion ?? 0) - (Date.now() - started) / 1000;
      if (remaining <= 0) {
        window.clearInterval(id);
        setTimeLeft(0);
        lock(null);
      } else {
        setTimeLeft(remaining);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [timed, locked, done, index, timePerQuestion, lock]);

  function advance() {
    if (index + 1 >= total) {
      setDone(true);
      submit(score);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setLocked(false);
  }

  function restart() {
    setRound(buildRound(pool, meta.rounds));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setLocked(false);
    setDone(false);
    setTimeLeft(timePerQuestion ?? 0);
  }

  function optionState(option: string): OptionState {
    if (!locked || !current) return "idle";
    if (option === current.q.answer) return "correct";
    if (option === selected) return "wrong";
    return "muted";
  }

  if (done) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const verdict =
      pct >= 90
        ? "Cloud-native."
        : pct >= 60
          ? "Solid footing."
          : pct >= 30
            ? "Getting there."
            : "Worth another run.";
    return (
      <GamePanel accent={meta.accent}>
        <div className="flex items-center justify-between">
          <ExitButton onExit={onExit} />
          <Stat label={meta.bestLabel} value={best} />
        </div>
        <div className="py-8 text-center sm:py-12">
          <p
            className="font-mono text-xs tracking-[0.2em] uppercase"
            style={{ color: meta.accent }}
          >
            Round complete
          </p>
          <p className="font-display mt-6 text-6xl font-bold tracking-tight tabular-nums sm:text-7xl">
            {score}
            <span className="text-muted-foreground text-3xl sm:text-4xl">
              /{total}
            </span>
          </p>
          <p className="font-display mt-3 text-xl font-semibold sm:text-2xl">
            {verdict}
          </p>
          <p className="text-muted-foreground mt-2 font-mono text-sm">
            {score === best && score > 0
              ? "New personal best."
              : `Best: ${best}`}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={restart} size="lg" className="rounded-full">
              <RotateCcw className="size-4" />
              Play again
            </Button>
            <Button
              onClick={onExit}
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              Back to arcade
            </Button>
          </div>
        </div>
      </GamePanel>
    );
  }

  if (!current) return null;

  const lowTime = timed && timeLeft <= 3;

  return (
    <GamePanel accent={meta.accent}>
      <div className="flex items-center justify-between gap-4">
        <ExitButton onExit={onExit} />
        <div className="flex items-center gap-6">
          {timed ? (
            <div
              className="flex items-center gap-2 font-mono text-sm tabular-nums"
              style={lowTime ? { color: WRONG } : undefined}
            >
              <Timer className="size-4" />
              {Math.ceil(timeLeft)}s
            </div>
          ) : null}
          <Stat label="Score" value={score} accent />
          <Stat label={meta.bestLabel} value={best} />
        </div>
      </div>

      <div className="mt-6">
        <div className="text-muted-foreground mb-2 flex items-center justify-between font-mono text-[0.65rem] tracking-[0.15em] uppercase">
          <span style={{ color: meta.accent }}>{eyebrow}</span>
          <span>
            {index + 1} / {total}
          </span>
        </div>
        <ProgressBar current={index + (locked ? 1 : 0)} total={total} />
      </div>

      <div className="mt-8">
        <p className="text-muted-foreground font-mono text-[0.65rem] tracking-[0.2em] uppercase">
          {promptLabel}
        </p>
        <h3 className="font-display mt-3 text-xl leading-snug font-bold tracking-[-0.01em] text-balance sm:text-2xl lg:text-[1.75rem]">
          {current.q.prompt}
        </h3>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {current.options.map((option, i) => (
          <OptionButton
            key={option}
            label={option}
            index={i}
            state={optionState(option)}
            disabled={locked}
            onClick={() => lock(option)}
          />
        ))}
      </div>

      <div className="mt-7 flex min-h-11 items-center justify-between gap-4">
        <p
          className={cn(
            "font-mono text-sm transition-opacity",
            locked ? "opacity-100" : "opacity-0",
          )}
        >
          {locked
            ? selected === current.q.answer
              ? "Correct."
              : selected === null
                ? `Time. It was ${current.q.answer}.`
                : `Not quite — it's ${current.q.answer}.`
            : "placeholder"}
        </p>
        {locked ? (
          <Button onClick={advance} className="rounded-full">
            {index + 1 >= total ? "See results" : "Next"}
          </Button>
        ) : null}
      </div>
    </GamePanel>
  );
}
