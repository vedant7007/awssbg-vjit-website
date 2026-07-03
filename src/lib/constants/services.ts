import type { LucideIcon } from "lucide-react";
import { BookOpen, Hammer, Trophy, Rocket, Mic } from "lucide-react";

export type Pillar = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

/** The five pillars of AWS SBG VJIT. Copy is real, no stats. */
export const PILLARS: Pillar[] = [
  {
    key: "learn",
    title: "Learn",
    description:
      "Hands-on sessions on cloud fundamentals, from your first EC2 instance to serverless patterns.",
    icon: BookOpen,
  },
  {
    key: "build",
    title: "Build",
    description:
      "Turn ideas into deployed projects with peers who ship, not just plan.",
    icon: Hammer,
  },
  {
    key: "compete",
    title: "Compete",
    description:
      "Hackathons and challenges where you sharpen skills against a real clock.",
    icon: Trophy,
  },
  {
    key: "ship",
    title: "Ship",
    description:
      "Take projects to production on AWS and put your name on something live.",
    icon: Rocket,
  },
  {
    key: "speak",
    title: "Speak",
    description:
      "Share what you learned through talks, workshops, and community meetups.",
    icon: Mic,
  },
];
