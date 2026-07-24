import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Hammer,
  Users,
  Trophy,
  Calendar,
  GraduationCap,
  Award,
  Rocket,
} from "lucide-react";

/**
 * Real club content, sourced from the group leader's content document.
 * Nothing here is invented — if a figure or claim can't be verified, it does
 * not belong in this file.
 */

/* ------------------------------- identity ------------------------------- */

export const CLUB = {
  name: "AWS SBG VJIT",
  fullName: "AWS Student Builder Group, VJIT",
  institute: "Vidya Jyothi Institute of Technology",
  tagline: "Learn cloud. Build projects. Grow together.",
  intro:
    "AWS Student Builder Group at Vidya Jyothi Institute of Technology is a student-led community helping students explore cloud computing, AWS technologies, projects, events, and career opportunities.",
  pillars: ["Workshops", "Projects", "Hackathons", "Cloud Community"],
} as const;

/* ------------------------------ what we do ------------------------------ */

export type WhatWeDo = {
  key: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
};

export const WHAT_WE_DO: WhatWeDo[] = [
  {
    key: "learn",
    title: "Learn",
    blurb: "Hands-on workshops and AWS learning sessions.",
    icon: BookOpen,
  },
  {
    key: "build",
    title: "Build",
    blurb: "Create cloud projects and practical solutions.",
    icon: Hammer,
  },
  {
    key: "connect",
    title: "Connect",
    blurb: "Meet students, professionals and AWS community members.",
    icon: Users,
  },
  {
    key: "compete",
    title: "Compete",
    blurb: "Participate in challenges, hackathons and project showcases.",
    icon: Trophy,
  },
];

/* ------------------------------- impact --------------------------------- */

export type ImpactStat = {
  key: string;
  value: string;
  label: string;
  icon: LucideIcon;
};

/** Verified figures only. */
export const IMPACT_STATS: ImpactStat[] = [
  { key: "events", value: "2+", label: "Events conducted", icon: Calendar },
  {
    key: "students",
    value: "150+",
    label: "Students reached",
    icon: GraduationCap,
  },
  { key: "team", value: "40+", label: "Core team members", icon: Users },
  { key: "badge", value: "Silver", label: "AWS SBG Badge", icon: Award },
];

/* ------------------------- about page: who we are ----------------------- */

export const ABOUT = {
  heading: "About AWS SBG VJIT",
  lead: "A student-led community where curious minds explore cloud technology, build practical skills, and connect through shared learning experiences.",
  whoWeAre:
    "AWS Student Builder Group VJIT is a student-led technology community at Vidya Jyothi Institute of Technology. We bring together students who are interested in cloud computing, AWS technologies, development, and innovation. Through events, interactive activities, technical challenges, and collaborative experiences, we aim to make technology more approachable and engaging for students at every skill level.",
  mission:
    "To create an inclusive student community that encourages learning by doing, promotes collaboration, and helps students confidently explore cloud and modern technologies.",
  vision:
    "To build a strong culture of student builders at VJIT where ideas are explored, skills are developed, and technology is used to create meaningful solutions.",
} as const;

/* -------------------------------- values -------------------------------- */

export type Value = { key: string; title: string; blurb: string };

export const VALUES: Value[] = [
  {
    key: "curiosity",
    title: "Curiosity",
    blurb:
      "We encourage students to ask questions and explore new technologies.",
  },
  {
    key: "collaboration",
    title: "Collaboration",
    blurb:
      "We believe people learn better when they build and solve problems together.",
  },
  {
    key: "inclusivity",
    title: "Inclusivity",
    blurb:
      "Students from every branch, year, and experience level should feel welcome.",
  },
  {
    key: "practical",
    title: "Practical Learning",
    blurb:
      "We focus on activities that help students understand how technology is used.",
  },
  {
    key: "community",
    title: "Community",
    blurb: "We grow by supporting and learning from one another.",
  },
];

/* -------------------------------- journey ------------------------------- */

export type Milestone = { key: string; title: string; blurb: string };

/** Dates intentionally omitted until the team confirms each one. */
export const JOURNEY: Milestone[] = [
  {
    key: "established",
    title: "Community Established",
    blurb:
      "AWS Student Builder Group was introduced at VJIT to create a student cloud community.",
  },
  {
    key: "first-event",
    title: "First Learning Event",
    blurb:
      "The group conducted its introductory session on cloud computing and AWS.",
  },
  {
    key: "cloud-tycoon",
    title: "Cloud Tycoon",
    blurb:
      "Students participated in an interactive cloud and business strategy challenge.",
  },
  {
    key: "silver",
    title: "Silver Badge Milestone",
    blurb: "The community achieved the AWS Student Builder Group Silver Badge.",
  },
  {
    key: "website",
    title: "Official Website Launch",
    blurb:
      "The club introduced its website as a central place for events, activities, tools, and community updates.",
  },
];

/* ---------------------------------- FAQ --------------------------------- */

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "Who can join AWS SBG VJIT?",
    a: "Students interested in cloud computing, AWS, development, or technology can join the community. Previous AWS experience is not required.",
  },
  {
    q: "Is the community only for CSE students?",
    a: "No. Students from any branch who are interested in technology can participate.",
  },
  {
    q: "Do I need an AWS account?",
    a: "Not for every activity. The event requirements will clearly mention when an AWS account or laptop is needed.",
  },
  {
    q: "Is joining the community free?",
    a: "Yes, joining the student community and participating in most community activities is free. Any exception will be communicated clearly.",
  },
  {
    q: "How can I receive event updates?",
    a: "Students can join the official community channel and follow the club's social media pages.",
  },
  {
    q: "Can I become part of the core team?",
    a: "Core team applications will be announced whenever recruitment is open.",
  },
];

/* --------------------------- closing call to action --------------------- */

export const CLOSING_CTA = {
  heading: "Ready to start building on AWS?",
  blurb:
    "Join a community of students learning cloud technologies, building projects and growing together.",
  icon: Rocket,
} as const;

/** Legal line required wherever the AWS name appears. */
export const AWS_DISCLAIMER =
  "AWS Student Builder Group VJIT is a student community. AWS and related trademarks belong to Amazon Web Services, Inc.";
