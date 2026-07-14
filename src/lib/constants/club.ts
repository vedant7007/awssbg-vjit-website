import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  Boxes,
  ServerCog,
  BrainCircuit,
  ShieldCheck,
  Ticket,
  BadgeCheck,
  FileText,
  Gift,
  Users,
  Rocket,
} from "lucide-react";

/**
 * Curated club content. These are real program formats, learning domains, and
 * member perks the group runs / offers — editorial constants, not live data.
 * Live counts, projects, events, and the leaderboard come from Firestore.
 */

export type Program = {
  key: string;
  name: string;
  cadence: string;
  blurb: string;
  icon: LucideIcon;
  flagship?: boolean;
};

export const PROGRAMS: Program[] = [
  {
    key: "foundations",
    name: "Cloud Foundations",
    cadence: "Weekly",
    blurb:
      "Hands-on sessions from your first EC2 instance to IAM, S3, and VPC. Bring a laptop, leave with something running.",
    icon: Cloud,
  },
  {
    key: "genai-camp",
    name: "GenAI Camp",
    cadence: "Cohort",
    blurb:
      "Build with Amazon Bedrock and foundation models — RAG, agents, and real apps, not slideware.",
    icon: BrainCircuit,
  },
  {
    key: "infrabuild",
    name: "InfraBuild Sprints",
    cadence: "Monthly",
    blurb:
      "Timed build sprints: containers, CI/CD, and infrastructure-as-code shipped end to end over a weekend.",
    icon: ServerCog,
  },
  {
    key: "community-day",
    name: "Student Community Day",
    cadence: "Flagship",
    blurb:
      "The big one. Talks, parallel tracks, an architecture battle, and the wider AWS community on campus.",
    icon: Users,
    flagship: true,
  },
  {
    key: "placement-drill",
    name: "Mock Placement Drill",
    cadence: "Seasonal",
    blurb:
      "Cloud-role interview prep — resume reviews, mock rounds, and the questions companies actually ask.",
    icon: BadgeCheck,
  },
  {
    key: "architecture-battle",
    name: "Show Me Your Architecture",
    cadence: "Recurring",
    blurb:
      "Whiteboard your design, defend it to a panel, and learn how the room would have built it differently.",
    icon: Boxes,
  },
];

export type Track = {
  key: string;
  name: string;
  blurb: string;
  services: string[];
  icon: LucideIcon;
};

export const TRACKS: Track[] = [
  {
    key: "cloud",
    name: "Cloud Foundations",
    blurb: "The core of AWS — compute, storage, networking, and identity.",
    services: ["EC2", "S3", "VPC", "IAM", "CloudFront", "Route 53"],
    icon: Cloud,
  },
  {
    key: "devops",
    name: "DevOps & Infra",
    blurb: "Ship reliably — containers, pipelines, and infrastructure as code.",
    services: ["Docker", "ECS", "CodePipeline", "Terraform", "CloudWatch"],
    icon: ServerCog,
  },
  {
    key: "serverless",
    name: "Backend & Serverless",
    blurb: "Event-driven APIs and data that scale to zero and back.",
    services: ["Lambda", "API Gateway", "DynamoDB", "Cognito", "SQS"],
    icon: Boxes,
  },
  {
    key: "ai",
    name: "AI / ML",
    blurb: "From managed models to your own — build intelligent products.",
    services: ["Bedrock", "SageMaker", "Rekognition", "Textract"],
    icon: BrainCircuit,
  },
  {
    key: "security",
    name: "Cloud Security",
    blurb: "Least privilege, detection, and protecting what you deploy.",
    services: ["IAM", "GuardDuty", "WAF", "KMS", "Security Hub"],
    icon: ShieldCheck,
  },
];

export type Perk = {
  key: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
};

export const PERKS: Perk[] = [
  {
    key: "vouchers",
    title: "Certification vouchers",
    blurb: "Discounted AWS exam vouchers — go from learning to certified.",
    icon: Ticket,
  },
  {
    key: "credits",
    title: "AWS credits",
    blurb: "Cloud credits so your side projects run on real infrastructure.",
    icon: Cloud,
  },
  {
    key: "reviews",
    title: "Resume & mock interviews",
    blurb: "Get your resume torn apart kindly and your interviews rehearsed.",
    icon: FileText,
  },
  {
    key: "spotlight",
    title: "Get featured",
    blurb: "Ship something good and we put it on the blog and our socials.",
    icon: Rocket,
  },
  {
    key: "swag",
    title: "Swag & event access",
    blurb: "Stickers, tees, and a seat at every workshop and community day.",
    icon: Gift,
  },
  {
    key: "network",
    title: "A real network",
    blurb: "Peers who ship, alumni in the industry, and the AWS community.",
    icon: Users,
  },
];
