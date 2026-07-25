"use client";

import * as React from "react";
import { Delete, CornerDownLeft } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { CLOUDLE_WORDS, GAMES, cloudleWordForDate } from "./games";
import { useBestScore } from "./useBestScore";
import { ExitButton, GamePanel, Stat } from "./shared";

const META = GAMES.find((g) => g.id === "cloudle")!;

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const STREAK_KEY = "awssbg:playground:cloudle:streak";
const STATE_KEY = "awssbg:playground:cloudle:state";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

/** Per-letter verdict, in the usual Wordle sense. */
type Verdict = "correct" | "present" | "absent";

type Saved = {
  /** Local calendar day the state belongs to, as YYYY-MM-DD. */
  day: string;
  guesses: string[];
};

function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * Score one guess against the answer with correct duplicate-letter handling:
 * exact matches are claimed first, then each remaining letter can only be
 * marked "present" while an unclaimed copy of it is left in the answer.
 */
export function scoreGuess(guess: string, answer: string): Verdict[] {
  const result: Verdict[] = Array.from(
    { length: guess.length },
    () => "absent",
  );
  const pool = new Map<string, number>();

  for (let i = 0; i < answer.length; i++) {
    const ch = answer[i];
    const g = guess[i];
    if (ch === undefined) continue;
    if (g === ch) result[i] = "correct";
    else pool.set(ch, (pool.get(ch) ?? 0) + 1);
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    const g = guess[i];
    if (g === undefined) continue;
    const left = pool.get(g) ?? 0;
    if (left > 0) {
      result[i] = "present";
      pool.set(g, left - 1);
    }
  }

  return result;
}

const TINT: Record<Verdict, { bg: string; fg: string }> = {
  correct: { bg: "#2EE6A0", fg: "#06080e" },
  present: { bg: "#FF9900", fg: "#06080e" },
  absent: { bg: "transparent", fg: "inherit" },
};

/**
 * A five-letter cloud word, six guesses, one puzzle per local day. Progress and
 * the streak persist to localStorage, so refreshing keeps the board. All state
 * is read inside effects, never during render, so hydration stays clean.
 */
export function Cloudle({ onExit }: { onExit: () => void }) {
  const { best, submit } = useBestScore(META.bestKey);

  const [answer, setAnswer] = React.useState("");
  const [hint, setHint] = React.useState("");
  const [guesses, setGuesses] = React.useState<string[]>([]);
  const [draft, setDraft] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const solved = guesses.includes(answer) && answer !== "";
  const done = solved || guesses.length >= MAX_GUESSES;

  // Pick the day's word and restore any progress already made on it.
  React.useEffect(() => {
    const today = new Date();
    const picked = cloudleWordForDate(today);
    setAnswer(picked.word);
    setHint(picked.hint);

    const key = dayKey(today);
    try {
      const raw = window.localStorage.getItem(STATE_KEY);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "day" in parsed &&
          "guesses" in parsed
        ) {
          const saved = parsed as Saved;
          if (saved.day === key && Array.isArray(saved.guesses)) {
            setGuesses(saved.guesses.filter((g) => typeof g === "string"));
          }
        }
      }
    } catch {
      // A corrupt or unreadable entry just means starting fresh.
    }
    setReady(true);
  }, []);

  // Persist progress for the current day.
  React.useEffect(() => {
    if (!ready || guesses.length === 0) return;
    try {
      const payload: Saved = { day: dayKey(new Date()), guesses };
      window.localStorage.setItem(STATE_KEY, JSON.stringify(payload));
    } catch {
      // Best-effort.
    }
  }, [guesses, ready]);

  /**
   * Bank the streak once, on the transition into a solved board. A streak only
   * continues when the previous solve was the day before; solving today after
   * skipping a day starts again at 1. Re-solving the same day is a no-op.
   */
  const streakBanked = React.useRef(false);
  React.useEffect(() => {
    if (!solved || streakBanked.current) return;
    streakBanked.current = true;

    const today = new Date();
    const key = dayKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = dayKey(yesterday);

    let next = 1;
    try {
      const lastDay = window.localStorage.getItem(`${STREAK_KEY}:day`);
      if (lastDay === key) return; // already counted today
      const rawCurrent = window.localStorage.getItem(`${STREAK_KEY}:current`);
      const current = rawCurrent === null ? 0 : Number.parseInt(rawCurrent, 10);
      if (lastDay === yesterdayKey && Number.isFinite(current) && current > 0) {
        next = current + 1;
      }
      window.localStorage.setItem(`${STREAK_KEY}:current`, String(next));
      window.localStorage.setItem(`${STREAK_KEY}:day`, key);
    } catch {
      // Private mode can throw; the in-session streak still reports.
    }
    submit(next);
  }, [solved, submit]);

  const commit = React.useCallback(() => {
    if (done) return;
    if (draft.length !== WORD_LENGTH) {
      setShake(true);
      return;
    }
    setGuesses((prev) => [...prev, draft]);
    setDraft("");
  }, [done, draft]);

  const press = React.useCallback(
    (key: string) => {
      if (done) return;
      if (key === "ENTER") {
        commit();
        return;
      }
      if (key === "BACK") {
        setDraft((d) => d.slice(0, -1));
        return;
      }
      setDraft((d) => (d.length >= WORD_LENGTH ? d : d + key));
    },
    [commit, done],
  );

  // Physical keyboard support.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") press("ENTER");
      else if (e.key === "Backspace") press("BACK");
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  React.useEffect(() => {
    if (!shake) return;
    const t = window.setTimeout(() => setShake(false), 350);
    return () => window.clearTimeout(t);
  }, [shake]);

  /** Best verdict seen so far for each letter, for colouring the keyboard. */
  const keyState = React.useMemo(() => {
    const map = new Map<string, Verdict>();
    if (answer === "") return map;
    const rank: Record<Verdict, number> = {
      absent: 0,
      present: 1,
      correct: 2,
    };
    for (const guess of guesses) {
      const verdicts = scoreGuess(guess, answer);
      for (let i = 0; i < guess.length; i++) {
        const ch = guess[i];
        const v = verdicts[i];
        if (ch === undefined || v === undefined) continue;
        const prev = map.get(ch);
        if (prev === undefined || rank[v] > rank[prev]) map.set(ch, v);
      }
    }
    return map;
  }, [guesses, answer]);

  const rows = React.useMemo(() => {
    const out: { letters: string; verdicts: Verdict[] | null }[] = [];
    for (let i = 0; i < MAX_GUESSES; i++) {
      const submitted = guesses[i];
      if (submitted !== undefined) {
        out.push({
          letters: submitted,
          verdicts: scoreGuess(submitted, answer),
        });
      } else if (i === guesses.length && !done) {
        out.push({ letters: draft, verdicts: null });
      } else {
        out.push({ letters: "", verdicts: null });
      }
    }
    return out;
  }, [guesses, draft, answer, done]);

  return (
    <GamePanel accent={META.accent}>
      <div className="flex items-start justify-between gap-6">
        <div>
          <ExitButton onExit={onExit} />
          <h2 className="font-display mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {META.title}
          </h2>
        </div>
        <div className="flex gap-6">
          <Stat
            label="Guess"
            value={`${Math.min(guesses.length + (done ? 0 : 1), MAX_GUESSES)}/${MAX_GUESSES}`}
            accent
          />
          <Stat label="Streak" value={best} />
        </div>
      </div>

      <p className="text-muted-foreground mt-6 font-mono text-xs tracking-[0.14em] uppercase">
        Word of the day · {CLOUDLE_WORDS.length} in rotation
      </p>

      {/* board */}
      <div className="mx-auto mt-6 grid max-w-xs gap-1.5">
        {rows.map((row, r) => (
          <div
            key={r}
            className={cn(
              "grid grid-cols-5 gap-1.5",
              shake && r === guesses.length && "animate-[cloudle-shake_0.35s]",
            )}
          >
            {Array.from({ length: WORD_LENGTH }, (_, c) => {
              const ch = row.letters[c] ?? "";
              const v = row.verdicts?.[c];
              const tint = v ? TINT[v] : null;
              return (
                <div
                  key={c}
                  className={cn(
                    "font-display grid aspect-square place-items-center rounded-md text-xl font-bold uppercase ring-1 transition-colors sm:text-2xl",
                    tint && v !== "absent"
                      ? "ring-transparent"
                      : ch
                        ? "ring-foreground/30"
                        : "ring-border/50",
                    v === "absent" && "text-muted-foreground/45 ring-border/40",
                  )}
                  style={
                    tint && v !== "absent"
                      ? { backgroundColor: tint.bg, color: tint.fg }
                      : undefined
                  }
                >
                  {ch}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {done ? (
        <div className="mt-8 text-center">
          <p
            className="font-display text-2xl font-bold tracking-tight"
            style={{ color: solved ? "#2EE6A0" : undefined }}
          >
            {solved ? "Solved" : answer}
          </p>
          <p className="text-muted-foreground mx-auto mt-3 max-w-sm text-sm leading-relaxed">
            {hint}
          </p>
          <p className="text-muted-foreground mt-6 font-mono text-[0.7rem] tracking-wide">
            A new word unlocks at midnight.
          </p>
          <button
            type="button"
            onClick={onExit}
            className="ring-border/60 hover:bg-foreground/[0.04] focus-visible:ring-ring mt-7 rounded-full px-7 py-3 font-mono text-xs tracking-[0.16em] uppercase ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            Back to arcade
          </button>
        </div>
      ) : (
        <div className="mx-auto mt-8 grid max-w-md gap-1.5">
          {ROWS.map((row, i) => (
            <div key={row} className="flex justify-center gap-1.5">
              {i === 2 ? (
                <KeyCap wide onClick={() => press("ENTER")} label="Enter">
                  <CornerDownLeft className="size-4" />
                </KeyCap>
              ) : null}
              {row.split("").map((ch) => (
                <KeyCap
                  key={ch}
                  onClick={() => press(ch)}
                  label={ch}
                  verdict={keyState.get(ch)}
                >
                  {ch}
                </KeyCap>
              ))}
              {i === 2 ? (
                <KeyCap wide onClick={() => press("BACK")} label="Backspace">
                  <Delete className="size-4" />
                </KeyCap>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </GamePanel>
  );
}

function KeyCap({
  children,
  onClick,
  label,
  wide = false,
  verdict,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  wide?: boolean;
  verdict?: Verdict | undefined;
}) {
  const tint = verdict ? TINT[verdict] : null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "focus-visible:ring-ring grid h-11 place-items-center rounded font-mono text-xs font-bold uppercase ring-1 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:h-12 sm:text-sm",
        wide ? "w-12 sm:w-14" : "w-[8.5%] min-w-[1.75rem] flex-1",
        verdict === "absent"
          ? "text-muted-foreground/40 ring-border/40"
          : "ring-border/60 hover:bg-foreground/[0.06]",
      )}
      style={
        tint && verdict !== "absent"
          ? { backgroundColor: tint.bg, color: tint.fg, borderColor: tint.bg }
          : undefined
      }
    >
      {children}
    </button>
  );
}
