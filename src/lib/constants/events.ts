import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Cloud,
  LineChart,
  ServerCog,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";

/**
 * Every event we have actually run, transcribed from the official post-event
 * reports filed with the Department of CSE. Nothing here is invented — figures,
 * names and dates come straight from those documents. If a report doesn't state
 * something (a venue, a headcount), the field stays out rather than being
 * guessed at.
 *
 * This is the source of truth for /events and /events/[slug]. It's a static
 * module on purpose: two events with bespoke, hand-written report content
 * render instantly and cost nothing at request time.
 */

/* --------------------------------- types --------------------------------- */

export type EventCategoryKey = "workshop" | "competition";

export type EventStat = {
  value: string;
  label: string;
};

/** One round of a multi-round simulation, e.g. "Year 1 — The Cleanup". */
export type EventRound = {
  tag: string;
  title: string;
  body: string;
  icon: LucideIcon;
  color: string;
};

/** A role participants took on during a team event. */
export type EventRole = {
  code: string;
  title: string;
  body: string;
  color: string;
};

/** One weighted component of a scoring model. */
export type EventMetric = {
  label: string;
  weight: number;
  description: string;
};

export type EventWinner = {
  name: string;
  detail: string;
};

export type EventCredit = {
  role: string;
  name: string;
  detail: string;
};

export type ClubEvent = {
  slug: string;
  title: string;
  /** Long-form title used on the detail page hero, if it differs. */
  fullTitle: string;
  subtitle: string;
  summary: string;
  category: EventCategoryKey;
  categoryLabel: string;
  /** ISO date of the event, for sorting and <time>. */
  date: string;
  dateLabel: string;
  dateShort: string;
  venue: string | null;
  department: string;
  organiser: string;
  audience: string;
  /** Index thumbnail + detail hero. */
  cover: string;
  coverAlt: string;
  /** Honest note when the imagery isn't a record of the session itself. */
  coverNote: string | null;
  gallery: { src: string; alt: string }[];
  stats: EventStat[];
  overview: string[];
  rounds: { title: string; intro: string; items: EventRound[] } | null;
  roles: { title: string; intro: string; items: EventRole[] } | null;
  scoring: { title: string; intro: string; metrics: EventMetric[] } | null;
  winners: { title: string; intro: string; items: EventWinner[] } | null;
  feedback: string | null;
  outcomes: { title: string; body: string[] } | null;
  conclusion: string[] | null;
  credits: EventCredit[];
};

/* -------------------------------- palette -------------------------------- */

/** Per-round accents. Kept off the brand orange so the rounds read as a scale. */
const ROUND_COLORS = {
  cleanup: "#2EE6A0",
  commitment: "#43B4FF",
  viral: "#FF9900",
  failure: "#FF5C5C",
  warfare: "#AD5CFF",
} as const;

/* -------------------------------- events --------------------------------- */

const INTRO_TO_AWS: ClubEvent = {
  slug: "introduction-to-cloud-computing-and-aws",
  title: "Introduction to Cloud Computing and AWS",
  fullTitle: "Introduction to Cloud Computing and AWS",
  subtitle: "The session that started the club",
  summary:
    "Our first session: an open-door introduction to cloud infrastructure, deployment models and the AWS services behind them — closed out with a live quiz.",
  category: "workshop",
  categoryLabel: "Workshop",
  date: "2026-02-06",
  dateLabel: "6 February 2026",
  dateShort: "06 Feb 2026",
  venue: null,
  department: "Computer Science and Engineering",
  organiser: "AWS Cloud Club — VJIT",
  audience: "Open to all years — CSE, IT, DS and AI&DS",
  cover: "/events/intro-to-aws/cover.jpg",
  coverAlt:
    "The AWS Cloud Club VJIT organising team seated in front of the welcome slide",
  coverNote: null,
  gallery: [
    {
      src: "/events/intro-to-aws/01.jpg",
      alt: "The organising team in front of the AWS Cloud Club VJIT welcome slide",
    },
    {
      src: "/events/intro-to-aws/02.jpg",
      alt: "Participants and faculty gathered for a group photo at the end of the session",
    },
    {
      src: "/events/intro-to-aws/03.jpg",
      alt: "A full seminar hall of students during the session",
    },
    {
      src: "/events/intro-to-aws/04.jpg",
      alt: "Faculty and students on stage during the session",
    },
    {
      src: "/events/intro-to-aws/05.jpg",
      alt: "A certificate being presented on stage",
    },
    {
      src: "/events/intro-to-aws/06.jpg",
      alt: "Faculty members seated in the audience",
    },
    {
      src: "/events/intro-to-aws/07.jpg",
      alt: "Dr. D. Aruna Kumari addressing the hall from the podium",
    },
  ],
  stats: [
    { value: "100", label: "Participants" },
    { value: "04", label: "Departments" },
    { value: "02", label: "Quiz winners" },
    { value: "01", label: "First club event" },
  ],
  overview: [
    "The Department of Computer Science and Engineering, under the guidance of Dr. A. Srujana, Principal, and Dr. D. Aruna Kumari, Head of the Department (CSE), organised an informative and interactive session through the AWS Cloud Club, coordinated by Dr. K. Rajesh Kannan, Faculty Coordinator. The event was conducted with the aim of introducing students to the fundamentals of cloud computing and highlighting the growing importance of AWS technologies in modern computing environments.",
    "During the session, participants were introduced to key concepts related to cloud computing, including cloud infrastructure, deployment models, and the practical applications of AWS services in real-world scenarios. The session focused on explaining how cloud platforms help organisations build scalable, reliable and efficient systems. Through clear explanations and practical examples, students were able to gain a better understanding of how cloud technologies are transforming the way applications are developed and managed.",
    "To make the session more engaging and interactive, a quiz was conducted for the participants based on the concepts discussed during the event. This activity encouraged students to actively recall and apply the knowledge they had gained, while also creating a lively and participative learning environment.",
  ],
  rounds: null,
  roles: null,
  scoring: null,
  winners: {
    title: "Quiz winners",
    intro:
      "The closing quiz ran live on the concepts covered in the session. Two winners were declared.",
    items: [
      { name: "BalaSai", detail: "IT-A · 1st year" },
      { name: "Pavan Karthik", detail: "IT-C · 2nd year" },
    ],
  },
  feedback:
    "Students said the session was very interactive and engaging, and many mentioned that they had a lot of fun while also learning new things. The real-life examples used during the event helped them understand the concepts better and made the session more relatable. Several said they would definitely attend similar events again, and appreciated that the format created a comfortable environment where they could learn and participate actively.",
  outcomes: {
    title: "Outcome",
    body: [
      "The event served as a valuable platform for students to explore the basics of cloud computing and gain insight into the practical significance of AWS technologies in today's rapidly evolving technological landscape.",
      "100 students attended, drawn from the CSE, IT, DS and AI&DS departments.",
    ],
  },
  conclusion: null,
  credits: [
    {
      role: "Principal",
      name: "Dr. A. Srujana",
      detail: "Vidya Jyothi Institute of Technology",
    },
    {
      role: "Head of Department",
      name: "Dr. D. Aruna Kumari",
      detail: "Computer Science & Engineering",
    },
    {
      role: "Faculty Coordinator",
      name: "Dr. K. Rajesh Kannan",
      detail: "AWS Cloud Club — VJIT",
    },
  ],
};

const CLOUD_TYCOON: ClubEvent = {
  slug: "cloud-tycoon-the-5-year-turnaround",
  title: "Cloud Tycoon: The 5-Year Turnaround",
  fullTitle: "Cloud-Tycoon: The 5-Year Turnaround",
  subtitle: "A cloud economics & infrastructure strategy simulation",
  summary:
    "Teams of three took over PulseStream — a video analytics startup bleeding money on AWS — and had five rounds, one per year, to turn it around without breaking it.",
  category: "competition",
  categoryLabel: "Simulation",
  date: "2026-04-30",
  dateLabel: "30 April 2026",
  dateShort: "30 Apr 2026",
  venue: "C-203 Lab",
  department: "Computer Science and Engineering",
  organiser: "AWS Cloud Clubs — VJIT",
  audience: "2nd year B.Tech students, in teams of three",
  cover: "/events/cloud-tycoon/cover.jpg",
  coverAlt: "The AWS Cloud Clubs table set up for the Cloud Tycoon simulation",
  coverNote:
    "Photography from this session is limited to the setup — the round footage was recorded on video.",
  gallery: [
    {
      src: "/events/cloud-tycoon/cover.jpg",
      alt: "The AWS Cloud Clubs table set up before the simulation",
    },
    {
      src: "/events/cloud-tycoon/01.jpg",
      alt: "Laptops laid out at the AWS Cloud Clubs table ahead of the rounds",
    },
    {
      src: "/events/cloud-tycoon/02.jpg",
      alt: "The C-203 lab set up for the Cloud Tycoon simulation",
    },
  ],
  stats: [
    { value: "05", label: "Rounds played" },
    { value: "03", label: "Roles per team" },
    { value: "$12k", label: "Monthly revenue to beat" },
    { value: "10x", label: "Traffic spike survived" },
  ],
  overview: [
    "The Department of Computer Science and Engineering, under the guidance of Dr. A. Srujana, Principal, and Dr. D. Aruna Kumari, Head of the Department (CSE), organised an engaging and competitive simulation event titled Cloud-Tycoon: The 5-Year Turnaround, conducted through the AWS Cloud Club and coordinated by Dr. K. Rajesh Kannan, Faculty Coordinator.",
    "Cloud-Tycoon is a team-based business simulation designed to immerse participants in the real-world challenges of managing a cloud-native startup. Students stepped into the role of decision-makers at PulseStream, a struggling video analytics startup haemorrhaging money on its AWS infrastructure. Each team of three assumed specialised roles — CTO Cloud Architect, CFO Financial Analyst, and PM Growth Lead — and worked collaboratively across five rounds, each representing one year in the company's life.",
  ],
  rounds: {
    title: "Five rounds, five years",
    intro:
      "The simulation was structured across five progressive rounds, each a distinct business scenario PulseStream hit on its path to global growth.",
    items: [
      {
        tag: "Year 1",
        title: "The Cleanup",
        body: "Teams audited PulseStream's bloated AWS infrastructure, identifying wasteful spending and eliminating idle resources. The objective was to get the AWS bill below the company's monthly revenue of $12,000 while maintaining service continuity.",
        icon: ServerCog,
        color: ROUND_COLORS.cleanup,
      },
      {
        tag: "Year 2",
        title: "Commitment Trap",
        body: "AWS Reserved Instance discounts tempted teams into long-term contracts. Teams had to evaluate utilisation rates, break-even thresholds, and the strategic risk of locking in resources prematurely.",
        icon: Banknote,
        color: ROUND_COLORS.commitment,
      },
      {
        tag: "Year 3",
        title: "Chaotic Virality",
        body: "A simulated viral event caused a 10x traffic spike overnight. Teams deployed Auto Scaling, CloudFront caching and Spot Instances to absorb the surge while keeping costs under control.",
        icon: TrendingUp,
        color: ROUND_COLORS.viral,
      },
      {
        tag: "Year 4",
        title: "Cascade Failure",
        body: "A simultaneous AWS outage, DDoS attack and security breach tested disaster-recovery plans. Multi-AZ deployments, RTO/RPO targets and incident response were critical to surviving this round.",
        icon: ShieldAlert,
        color: ROUND_COLORS.failure,
      },
      {
        tag: "Year 5",
        title: "Strategic Warfare",
        body: "Teams expanded PulseStream globally to Europe and Asia while a well-funded competitor entered the market. Multi-Region architecture, CDN strategy and cost efficiency determined the final Cloud Valuation Index score.",
        icon: Cloud,
        color: ROUND_COLORS.warfare,
      },
    ],
  },
  roles: {
    title: "Three seats at the table",
    intro:
      "Each team of three was assigned distinct roles that mirrored real-world cloud startup dynamics.",
    items: [
      {
        code: "CTO",
        title: "Cloud Architect",
        body: "Selected technical infrastructure, drew architecture diagrams, chose AWS services, and made deployment decisions.",
        color: ROUND_COLORS.commitment,
      },
      {
        code: "CFO",
        title: "Financial Analyst",
        body: "Tracked AWS spending, evaluated pricing models, calculated break-even points, and enforced budget constraints.",
        color: ROUND_COLORS.cleanup,
      },
      {
        code: "PM",
        title: "Growth Lead",
        body: "Focused on user growth, uptime requirements and scaling strategy — balancing feature velocity with cost discipline.",
        color: ROUND_COLORS.warfare,
      },
    ],
  },
  scoring: {
    title: "Cloud Valuation Index",
    intro:
      "Teams were evaluated on the Cloud Valuation Index (CVI), a composite score modelled after a weighted CGPA system. Its three components rewarded balanced decision-making across financial, operational and architectural dimensions.",
    metrics: [
      {
        label: "Net cumulative profit",
        weight: 50,
        description:
          "Total revenue minus total AWS costs across all five years.",
      },
      {
        label: "Uptime percentage",
        weight: 30,
        description:
          "Service availability during chaos events, especially Year 4.",
      },
      {
        label: "Cost efficiency",
        weight: 20,
        description:
          "Revenue generated per dollar spent on AWS infrastructure.",
      },
    ],
  },
  winners: null,
  feedback: null,
  outcomes: {
    title: "Learning outcomes",
    body: [
      "Participants gained hands-on exposure to core AWS services including EC2, S3, RDS, Auto Scaling and CloudFront. The event demystified cloud cost management concepts such as Reserved Instances, Spot Instances, Savings Plans and cross-zone traffic pricing. Students also developed an understanding of cloud reliability principles, including Multi-AZ deployments, Recovery Time Objective (RTO), Recovery Point Objective (RPO) and uptime SLA calculations.",
      "Beyond technical knowledge, Cloud-Tycoon cultivated critical thinking, team communication and financial decision-making under uncertainty — skills directly applicable to real-world cloud engineering and product management roles.",
    ],
  },
  conclusion: [
    "Cloud-Tycoon: The 5-Year Turnaround was a highly successful initiative by the AWS Cloud Club, VJIT. The event provided a practical, gamified learning environment that bridged the gap between theoretical cloud concepts and real-world infrastructure decision-making. The enthusiasm and analytical depth demonstrated by participants reaffirms the value of experiential learning in technology education.",
    "The AWS Cloud Club, VJIT, extends its gratitude to the Department of Computer Science and Engineering, the Principal, the Head of the Department and the Faculty Coordinator for their continued support in organising events that prepare students for careers in cloud computing.",
  ],
  credits: [
    {
      role: "Principal",
      name: "Dr. A. Srujana",
      detail: "Vidya Jyothi Institute of Technology",
    },
    {
      role: "Head of Department",
      name: "Dr. D. Aruna Kumari",
      detail: "Computer Science & Engineering",
    },
    {
      role: "Faculty Coordinator",
      name: "Dr. K. Rajesh Kannan",
      detail: "AWS Cloud Club — VJIT",
    },
  ],
};

/* -------------------------------- exports -------------------------------- */

/** Every event we've run, newest first. */
export const PAST_EVENTS: ClubEvent[] = [CLOUD_TYCOON, INTRO_TO_AWS];

/**
 * Nothing is scheduled publicly right now. When the next session is confirmed,
 * add it here and the "next up" band on /events lights up automatically.
 */
export const UPCOMING_EVENTS: ClubEvent[] = [];

export const ALL_EVENTS: ClubEvent[] = [...UPCOMING_EVENTS, ...PAST_EVENTS];

export function getEventBySlug(slug: string): ClubEvent | undefined {
  return ALL_EVENTS.find((e) => e.slug === slug);
}

/** Headline figures for the /events hero ledger. All verifiable from reports. */
export const EVENTS_LEDGER = [
  { value: "02", label: "Events run" },
  { value: "100+", label: "Students reached" },
  { value: "04", label: "Departments" },
  { value: "2026", label: "Active since" },
] as const;

export const EVENTS_INTRO = {
  eyebrow: "// what we run",
  title: "Events",
  lede: "Hands-on sessions, simulations and quizzes for students who want to actually use the cloud — not just read about it. Every event here has a filed report; the numbers below come from those.",
  icons: { trophy: Trophy, chart: LineChart, spark: Sparkles },
} as const;
