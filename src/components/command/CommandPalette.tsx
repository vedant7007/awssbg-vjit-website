"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Search,
  Users,
  FolderGit2,
  CalendarDays,
  ArrowRight,
  Loader2,
  Trophy,
  Terminal,
  Sun,
  Moon,
  Info,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/client";
import Fuse from "fuse.js";

import { cn } from "@/lib/utils/cn";
import { BorderGlow } from "@/components/ui/BorderGlow";
import {
  buildIndex,
  search,
  browseAll,
  type SearchData,
  type SearchItem,
} from "@/lib/search";

export interface SearchCommand {
  type: "command";
  id: string;
  title: string;
  subtitle: string;
  url: string;
  meta: string;
  iconName: "sun" | "moon" | "info" | "logout" | "calendar" | "trophy" | "user";
  action: (ctx: {
    setTheme: (t: string) => void;
    router: ReturnType<typeof useRouter>;
    toast: typeof toast;
    signOut: () => Promise<void>;
  }) => void;
}

const BUILT_IN_COMMANDS: SearchCommand[] = [
  {
    type: "command",
    id: "theme-dark",
    title: "Theme: Switch to Dark Mode",
    subtitle: "Change application appearance to dark theme",
    url: "#theme-dark",
    meta: "theme dark darkmode dark mode",
    iconName: "moon",
    action: ({ setTheme, toast }) => {
      setTheme("dark");
      toast.success("Theme changed to Dark Mode");
    },
  },
  {
    type: "command",
    id: "theme-light",
    title: "Theme: Switch to Light Mode",
    subtitle: "Change application appearance to light theme",
    url: "#theme-light",
    meta: "theme light lightmode light mode",
    iconName: "sun",
    action: ({ setTheme, toast }) => {
      setTheme("light");
      toast.success("Theme changed to Light Mode");
    },
  },
  {
    type: "command",
    id: "whoami",
    title: "Who Am I",
    subtitle: "Display organization information",
    url: "#whoami",
    meta: "whoami who am i user profile info help",
    iconName: "user",
    action: ({ toast }) => {
      toast.info(
        "AWS Student Builder Group VJIT: A vibrant student-led technical developer community building in the cloud.",
        { duration: 5000 },
      );
    },
  },
  {
    type: "command",
    id: "about",
    title: "About Page",
    subtitle: "Navigate to the About page",
    url: "/about",
    meta: "about about page story vjit history info",
    iconName: "info",
    action: ({ router }) => {
      router.push("/about");
    },
  },
  {
    type: "command",
    id: "events-upcoming",
    title: "Upcoming Events",
    subtitle: "Browse scheduled workshops and hackathons",
    url: "/events",
    meta: "events upcoming event schedule hackathon seminar workshop --upcoming",
    iconName: "calendar",
    action: ({ router }) => {
      router.push("/events");
    },
  },
  {
    type: "command",
    id: "leaderboard",
    title: "Leaderboard",
    subtitle: "View the member contribution leaderboard and roadmap",
    url: "/roadmap",
    meta: "leaderboard roadmap open leaderboard achievements points",
    iconName: "trophy",
    action: ({ router }) => {
      router.push("/roadmap");
    },
  },
  {
    type: "command",
    id: "signout",
    title: "Sign Out",
    subtitle: "Sign out of your developer session",
    url: "#signout",
    meta: "signout sign out logoff log out exit session",
    iconName: "logout",
    action: ({ signOut, toast }) => {
      signOut()
        .then(() => toast.success("Signed out successfully"))
        .catch((err: unknown) =>
          toast.error(
            "Error signing out: " +
              (err instanceof Error ? err.message : String(err)),
          ),
        );
    },
  },
];

// ---------------------------------------------------------------------------
// Module-level lazy cache — persists across re-renders and route changes.
// The data is only fetched once per browser session.
// ---------------------------------------------------------------------------
let _cachedData: SearchData | null = null;
let _cachedIndex: Fuse<SearchItem> | null = null;
let _fetchPromise: Promise<void> | null = null;

async function loadSearchData(): Promise<void> {
  if (_cachedData) return;
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = fetch("/api/search")
    .then((res) => res.json() as Promise<SearchData>)
    .then((data) => {
      _cachedData = data;
      _cachedIndex = buildIndex(data);
    })
    .finally(() => {
      _fetchPromise = null;
    });

  return _fetchPromise;
}

// ---------------------------------------------------------------------------
// Context — lets Nav / any component open the palette programmatically
// ---------------------------------------------------------------------------
interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue>({
  open: false,
  setOpen: () => undefined,
});

export function useCommandPalette() {
  return React.useContext(CommandPaletteContext);
}

// ---------------------------------------------------------------------------
// Provider — registers the global Ctrl/Cmd+K keyboard shortcut
// ---------------------------------------------------------------------------
export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(isoString: string | null) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Section header inside the results list
// ---------------------------------------------------------------------------
function ResultSection({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border/10 border-b pb-2 last:border-b-0">
      <div className="mt-2 flex items-center gap-2 px-4 py-2">
        <Icon className="text-orange/70 size-3.5 shrink-0" />
        <span className="eyebrow text-muted-foreground text-[0.68rem] font-semibold tracking-wider">
          {label}
        </span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single result row
// ---------------------------------------------------------------------------
function ResultItem({
  item,
  isActive,
  onSelect,
  onMouseEnter,
  id,
}: {
  item: SearchItem | SearchCommand;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  id: string;
}) {
  const ref = React.useRef<HTMLButtonElement>(null);

  // Scroll into view when keyboard-navigated to
  React.useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({ block: "nearest" });
    }
  }, [isActive]);

  const renderContent = () => {
    switch (item.type) {
      case "member": {
        const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.title)}`;
        const avatarSrc = item.avatarUrl || fallbackAvatar;
        return (
          <div className="flex w-full items-center gap-3">
            {/* Avatar */}
            <div className="border-border/80 bg-muted relative size-8.5 shrink-0 overflow-hidden rounded-full border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt={item.title}
                className="size-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = fallbackAvatar;
                }}
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-foreground truncate text-sm font-semibold">
                  {item.title}
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  {item.subtitle}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {item.meta || "Member"}
              </p>
            </div>

            {/* Team Badge */}
            {item.team && (
              <span className="border-border text-ink bg-paper-warm/40 hidden rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase sm:inline-block">
                {item.team}
              </span>
            )}
          </div>
        );
      }
      case "project": {
        const isFeatured = item.featured;
        return (
          <div className="flex w-full items-center gap-3">
            {/* Icon */}
            <div
              className={cn(
                "flex size-8.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                isActive
                  ? "bg-orange/15 border-orange/30 text-orange"
                  : "bg-muted border-border/80 text-muted-foreground",
              )}
            >
              <FolderGit2 className="size-4" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-foreground truncate text-sm font-semibold">
                  {item.title}
                </span>
                {isFeatured && (
                  <span className="bg-orange/15 text-orange border-orange/20 py-0.2 rounded-sm border px-1.5 font-mono text-[8px] font-semibold tracking-wider uppercase">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {item.subtitle}
              </p>

              {/* Tech Stack Pills */}
              {item.stack && item.stack.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.stack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-muted-foreground bg-muted/60 border-border/40 py-0.2 rounded-sm border px-1 font-mono text-[8px]"
                    >
                      {tech}
                    </span>
                  ))}
                  {item.stack.length > 3 && (
                    <span className="text-muted-foreground font-mono text-[8px]">
                      +{item.stack.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }
      case "event": {
        const isWorkshop = item.category === "workshop";
        const isHackathon = item.category === "hackathon";
        const dateStr = formatDate(item.startAt);
        const statusColors = {
          live: "bg-success/15 text-success border-success/20",
          upcoming: "bg-orange/15 text-orange border-orange/20",
          past: "bg-muted text-muted-foreground border-border/80",
        };
        const statusLabel = item.meta as "live" | "upcoming" | "past";

        return (
          <div className="flex w-full items-center gap-3">
            {/* Icon */}
            <div
              className={cn(
                "flex size-8.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                isActive
                  ? "bg-orange/15 border-orange/30 text-orange"
                  : "bg-muted border-border/80 text-muted-foreground",
              )}
            >
              {isHackathon ? (
                <Trophy className="size-4" />
              ) : isWorkshop ? (
                <Terminal className="size-4" />
              ) : (
                <CalendarDays className="size-4" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <span className="font-display text-foreground block truncate text-sm font-semibold">
                {item.title}
              </span>
              <div className="mt-0.5 flex items-center gap-2">
                {dateStr && (
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {dateStr}
                  </span>
                )}
                <span className="text-muted-foreground truncate text-xs">
                  • {item.subtitle}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <span
              className={cn(
                "rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider uppercase",
                statusColors[statusLabel] || statusColors.past,
              )}
            >
              {item.meta}
            </span>
          </div>
        );
      }
      case "command": {
        const cmd = item as SearchCommand;
        const IconComponent = (() => {
          switch (cmd.iconName) {
            case "sun":
              return Sun;
            case "moon":
              return Moon;
            case "info":
              return Info;
            case "logout":
              return LogOut;
            case "calendar":
              return CalendarDays;
            case "trophy":
              return Trophy;
            case "user":
              return Users;
            default:
              return Terminal;
          }
        })();

        return (
          <div className="flex w-full items-center gap-3">
            <div
              className={cn(
                "flex size-8.5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                isActive
                  ? "bg-orange/15 border-orange/30 text-orange"
                  : "bg-muted border-border/80 text-muted-foreground",
              )}
            >
              <IconComponent className="size-4" aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <span className="font-display text-foreground block truncate text-sm font-semibold">
                {cmd.title}
              </span>
              <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {cmd.subtitle}
              </p>
            </div>

            <span className="border-border text-orange bg-orange/5 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider uppercase">
              Action
            </span>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <button
      ref={ref}
      id={id}
      role="option"
      aria-selected={isActive}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "border-border/5 relative flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-all duration-200 last:border-b-0",
        isActive
          ? "from-orange/10 via-orange/[0.02] text-foreground after:bg-orange bg-gradient-to-r to-transparent after:absolute after:top-0 after:bottom-0 after:left-0 after:w-[3px] after:shadow-[0_0_8px_rgba(255,153,0,0.5)]"
          : "hover:bg-muted/30 text-muted-foreground hover:text-foreground",
      )}
    >
      <div
        className={cn(
          "min-w-0 flex-1 transition-all duration-200",
          isActive && "translate-x-0.5",
        )}
      >
        {renderContent()}
      </div>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-1 shrink-0"
        >
          <ArrowRight className="text-orange size-3.5" aria-hidden />
        </motion.div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Empty / loading states
// ---------------------------------------------------------------------------
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="bg-muted/50 border-border/60 mb-4 flex size-12 items-center justify-center rounded-full border">
        <Search className="text-muted-foreground/60 size-5" />
      </div>
      <h3 className="font-display text-foreground mb-1 text-sm font-semibold">
        {query ? "No results found" : "Search AWS SBG VJIT"}
      </h3>
      <p className="text-muted-foreground max-w-[280px] text-xs leading-relaxed">
        {query
          ? `We couldn't find anything matching "${query}". Please check your spelling or try another term.`
          : "Find members by name or username, upcoming events, and student projects."}
      </p>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="border-border/5 flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <div className="bg-muted/60 size-8.5 shrink-0 animate-pulse rounded-sm" />
      <div className="min-w-0 flex-1 animate-pulse space-y-2">
        <div className="bg-muted/60 h-4 w-1/3 rounded" />
        <div className="bg-muted/60 h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="py-2">
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="bg-muted/60 h-3 w-16 animate-pulse rounded" />
      </div>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main palette component
// ---------------------------------------------------------------------------
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<{
    commands: SearchCommand[];
    members: SearchItem[];
    events: SearchItem[];
    projects: SearchItem[];
  }>({
    commands: [],
    members: [],
    events: [],
    projects: [],
  });
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isFocused, setIsFocused] = React.useState(false);

  // Flat ordered list of all visible items (for keyboard navigation)
  const flatItems = React.useMemo(
    () => [
      ...results.commands,
      ...results.members,
      ...results.events,
      ...results.projects,
    ],
    [results],
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Load data lazily when the palette opens for the first time
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (!open) return;

    if (_cachedData) {
      // Already loaded — compute initial browse immediately
      const initial = browseAll(_cachedData);
      setResults({ commands: BUILT_IN_COMMANDS, ...initial });
      return;
    }

    setLoading(true);
    loadSearchData()
      .then(() => {
        if (_cachedData) {
          setResults({
            commands: BUILT_IN_COMMANDS,
            ...browseAll(_cachedData),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [open]);

  // ---------------------------------------------------------------------------
  // Reset state when closing
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (!open) {
      // Delay the reset so it doesn't flash during close animation
      const t = setTimeout(() => {
        setQuery("");
        setActiveIndex(0);
        setResults({ commands: [], members: [], events: [], projects: [] });
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Focus the input when the palette opens
  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // ---------------------------------------------------------------------------
  // Debounced search
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (!_cachedIndex || !_cachedData) return;

    const t = setTimeout(() => {
      const q = query.trim();
      const matchedCommands = q
        ? BUILT_IN_COMMANDS.filter(
            (cmd) =>
              cmd.title.toLowerCase().includes(q.toLowerCase()) ||
              cmd.meta.toLowerCase().includes(q.toLowerCase()),
          )
        : BUILT_IN_COMMANDS; // Show all commands if query is empty

      const next = q ? search(_cachedIndex!, q) : browseAll(_cachedData!);

      setResults({
        commands: matchedCommands,
        ...next,
      });
      setActiveIndex(0);
    }, 80); // 80ms debounce keeps it under 50ms total for normal datasets

    return () => clearTimeout(t);
  }, [query]);

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) navigate(item);
    }
  };

  const navigate = React.useCallback(
    (item: SearchItem | SearchCommand) => {
      onOpenChange(false);
      if (item.type === "command") {
        item.action({ setTheme, router, toast, signOut });
      } else {
        router.push(item.url);
      }
    },
    [onOpenChange, router, setTheme],
  );

  const totalResults = flatItems.length;

  // Generate a stable id for each row for aria-activedescendant
  const rowId = (i: number) => `cmd-result-${i}`;

  // Which global index does each section start at?
  const commandsStart = 0;
  const membersStart = results.commands.length;
  const eventsStart = membersStart + results.members.length;
  const projectsStart = eventsStart + results.events.length;

  const hasResults = totalResults > 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            {/* Overlay */}
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="bg-ink/65 fixed inset-0 z-50 backdrop-blur-[6px]"
              />
            </DialogPrimitive.Overlay>

            {/* Panel */}
            <DialogPrimitive.Content
              forceMount
              aria-label="Command palette"
              onKeyDown={handleKeyDown}
              className="fixed top-[15%] left-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 focus:outline-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -12 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full overflow-hidden rounded-md shadow-[0_24px_50px_-15px_rgba(0,0,0,0.65)]"
              >
                <BorderGlow
                  borderRadius={8}
                  glowRadius={32}
                  edgeSensitivity={40}
                  glowColor="36 100 50"
                  backgroundColor="var(--card)"
                  colors={["#ff9900", "#ff5500", "#ffaa00"]}
                  className="w-full"
                >
                  <div className="bg-card relative flex w-full flex-col overflow-hidden">
                    {/* Hidden accessible title */}
                    <DialogPrimitive.Title className="sr-only">
                      Command Palette
                    </DialogPrimitive.Title>

                    {/* Search input */}
                    <div
                      className={cn(
                        "bg-card relative z-10 flex items-center gap-3 border-b px-4 py-3.5 transition-all duration-300",
                        isFocused && "bg-orange/[0.01]",
                      )}
                    >
                      {loading ? (
                        <Loader2 className="text-orange size-4.5 shrink-0 animate-spin" />
                      ) : (
                        <Search
                          className={cn(
                            "size-4.5 shrink-0 transition-colors duration-300",
                            isFocused ? "text-orange" : "text-muted-foreground",
                          )}
                          aria-hidden
                        />
                      )}
                      <input
                        ref={inputRef}
                        type="text"
                        role="combobox"
                        aria-expanded={hasResults}
                        aria-controls="cp-listbox"
                        aria-activedescendant={
                          hasResults ? rowId(activeIndex) : undefined
                        }
                        aria-autocomplete="list"
                        placeholder="Search members, events, projects…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="font-display placeholder:text-muted-foreground/50 text-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <div className="flex shrink-0 items-center gap-1.5">
                        <kbd className="text-muted-foreground border-border bg-muted/50 hidden rounded border px-1.5 py-0.5 font-mono text-[9px] leading-none sm:inline-flex">
                          ESC
                        </kbd>
                      </div>
                    </div>

                    {/* Results */}
                    <div
                      id="cp-listbox"
                      role="listbox"
                      aria-label="Search results"
                      className="divide-border/5 max-h-[360px] scrollbar-thin divide-y overflow-y-auto"
                    >
                      {loading && !hasResults ? (
                        <LoadingState />
                      ) : !hasResults ? (
                        <EmptyState query={query} />
                      ) : (
                        <div className="py-1">
                          {results.commands.length > 0 && (
                            <ResultSection label="Commands" icon={Terminal}>
                              {results.commands.map((item, i) => (
                                <ResultItem
                                  key={item.id}
                                  id={rowId(commandsStart + i)}
                                  item={item}
                                  isActive={commandsStart + i === activeIndex}
                                  onSelect={() => navigate(item)}
                                  onMouseEnter={() =>
                                    setActiveIndex(commandsStart + i)
                                  }
                                />
                              ))}
                            </ResultSection>
                          )}

                          {results.members.length > 0 && (
                            <ResultSection label="Members" icon={Users}>
                              {results.members.map((item, i) => (
                                <ResultItem
                                  key={item.id}
                                  id={rowId(membersStart + i)}
                                  item={item}
                                  isActive={membersStart + i === activeIndex}
                                  onSelect={() => navigate(item)}
                                  onMouseEnter={() =>
                                    setActiveIndex(membersStart + i)
                                  }
                                />
                              ))}
                            </ResultSection>
                          )}

                          {results.events.length > 0 && (
                            <ResultSection label="Events" icon={CalendarDays}>
                              {results.events.map((item, i) => (
                                <ResultItem
                                  key={item.id}
                                  id={rowId(eventsStart + i)}
                                  item={item}
                                  isActive={eventsStart + i === activeIndex}
                                  onSelect={() => navigate(item)}
                                  onMouseEnter={() =>
                                    setActiveIndex(eventsStart + i)
                                  }
                                />
                              ))}
                            </ResultSection>
                          )}

                          {results.projects.length > 0 && (
                            <ResultSection label="Projects" icon={FolderGit2}>
                              {results.projects.map((item, i) => (
                                <ResultItem
                                  key={item.id}
                                  id={rowId(projectsStart + i)}
                                  item={item}
                                  isActive={projectsStart + i === activeIndex}
                                  onSelect={() => navigate(item)}
                                  onMouseEnter={() =>
                                    setActiveIndex(projectsStart + i)
                                  }
                                />
                              ))}
                            </ResultSection>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer hint */}
                    <div className="border-border/80 bg-muted/30 flex items-center gap-4 border-t px-4 py-2.5">
                      <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                        <kbd className="border-border bg-card rounded border px-1.5 py-0.5 font-mono text-[8px] shadow-sm">
                          ↑↓
                        </kbd>
                        Navigate
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                        <kbd className="border-border bg-card rounded border px-1.5 py-0.5 font-mono text-[8px] shadow-sm">
                          ↵
                        </kbd>
                        Open
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                        <kbd className="border-border bg-card rounded border px-1.5 py-0.5 font-mono text-[8px] shadow-sm">
                          ESC
                        </kbd>
                        Close
                      </span>
                      <div className="text-muted-foreground ml-auto hidden items-center gap-1 text-[10px] sm:flex">
                        <kbd className="border-border bg-card rounded border px-1 py-0.5 font-mono text-[8px] shadow-sm">
                          Ctrl+K
                        </kbd>
                        <span>to search</span>
                      </div>
                    </div>
                  </div>
                </BorderGlow>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
