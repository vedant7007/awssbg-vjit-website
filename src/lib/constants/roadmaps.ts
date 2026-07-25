import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  BrainCircuit,
  Code2,
  Compass,
  Network,
  ShieldCheck,
  Terminal,
} from "lucide-react";

/**
 * AWS certification paths. Every exam figure here — question count, duration,
 * passing score, price and exam code — was checked against the AWS exam guides
 * and certification pages, not recalled. AWS does revise these, so the page
 * links out to the official guide for each exam and says so in plain text.
 *
 * Prices are the standard USD list price; AWS varies them by region and runs
 * discounts, so they are labelled "from".
 */

/* --------------------------------- types --------------------------------- */

export type CertLevel = "Foundational" | "Associate" | "Professional";

export type Cert = {
  /** Official exam code, e.g. "SAA-C03". */
  code: string;
  name: string;
  level: CertLevel;
  /** Number of scored + unscored questions presented. */
  questions: number;
  /** Total exam time in minutes. */
  minutes: number;
  /** Minimum scaled score out of 1000. */
  passingScore: number;
  /** Standard list price in USD. */
  priceUsd: number;
  /** What passing it actually demonstrates. */
  proves: string;
  /** Concrete things to be comfortable with before booking. */
  covers: string[];
  /** Official AWS page for the certification. */
  url: string;
};

export type RoadmapStep = {
  cert: Cert;
  /** Why this step comes here, in the context of the path. */
  why: string;
  /** Honest prep estimate for a student starting from the previous step. */
  prep: string;
};

export type Roadmap = {
  slug: string;
  title: string;
  tagline: string;
  forWho: string;
  accent: string;
  icon: LucideIcon;
  steps: RoadmapStep[];
};

/* --------------------------------- exams --------------------------------- */

const CLF_C02: Cert = {
  code: "CLF-C02",
  name: "AWS Certified Cloud Practitioner",
  level: "Foundational",
  questions: 65,
  minutes: 90,
  passingScore: 700,
  priceUsd: 100,
  proves:
    "That you understand what the AWS cloud is, how it is billed and secured, and which service solves which broad problem — without needing to build anything yet.",
  covers: [
    "Cloud concepts and the value proposition",
    "Security, compliance and the shared responsibility model",
    "Core services: compute, storage, database, networking",
    "Billing, pricing models and support plans",
  ],
  url: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
};

const SAA_C03: Cert = {
  code: "SAA-C03",
  name: "AWS Certified Solutions Architect – Associate",
  level: "Associate",
  questions: 65,
  minutes: 130,
  passingScore: 720,
  priceUsd: 150,
  proves:
    "That you can design a system on AWS that stays up, stays secure and does not cost more than it has to — the single most recognised AWS certification.",
  covers: [
    "Designing resilient, multi-AZ architectures",
    "High-performing and elastic compute and storage choices",
    "Securing workloads with IAM, VPC design and encryption",
    "Cost-optimised architectures and the right storage tier",
  ],
  url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
};

const SAP_C02: Cert = {
  code: "SAP-C02",
  name: "AWS Certified Solutions Architect – Professional",
  level: "Professional",
  questions: 75,
  minutes: 180,
  passingScore: 750,
  priceUsd: 300,
  proves:
    "That you can make architecture calls across a whole organisation — multi-account, multi-region, migrations — and defend the trade-offs.",
  covers: [
    "Designing for organisational complexity and multi-account setups",
    "Designing new solutions against demanding requirements",
    "Continuous improvement of existing workloads",
    "Accelerating migration and modernisation",
  ],
  url: "https://aws.amazon.com/certification/certified-solutions-architect-professional/",
};

const DVA_C02: Cert = {
  code: "DVA-C02",
  name: "AWS Certified Developer – Associate",
  level: "Associate",
  questions: 65,
  minutes: 130,
  passingScore: 720,
  priceUsd: 150,
  proves:
    "That you can actually build, deploy and debug an application on AWS using the SDKs, not just draw it on a whiteboard.",
  covers: [
    "Development with AWS services and the SDKs",
    "Security: IAM roles, Cognito, encryption in your code",
    "Deployment with CI/CD pipelines and CloudFormation",
    "Troubleshooting and optimisation with CloudWatch and X-Ray",
  ],
  url: "https://aws.amazon.com/certification/certified-developer-associate/",
};

const DOP_C02: Cert = {
  code: "DOP-C02",
  name: "AWS Certified DevOps Engineer – Professional",
  level: "Professional",
  questions: 75,
  minutes: 180,
  passingScore: 750,
  priceUsd: 300,
  proves:
    "That you can run what you build: automated pipelines, monitoring that catches problems first, and recovery that works when it matters.",
  covers: [
    "SDLC automation and CI/CD at scale",
    "Configuration management and infrastructure as code",
    "Monitoring, logging and incident response",
    "Resilience, high availability and disaster recovery",
  ],
  url: "https://aws.amazon.com/certification/certified-devops-engineer-professional/",
};

const AIF_C01: Cert = {
  code: "AIF-C01",
  name: "AWS Certified AI Practitioner",
  level: "Foundational",
  questions: 65,
  minutes: 90,
  passingScore: 700,
  priceUsd: 100,
  proves:
    "That you can talk about AI, machine learning and generative AI on AWS accurately — what the terms mean, where Bedrock and SageMaker fit, and what responsible AI requires.",
  covers: [
    "Fundamentals of AI, ML and generative AI",
    "Foundation models, prompt engineering and Amazon Bedrock",
    "Responsible AI, bias and transparency",
    "Security, compliance and governance for AI solutions",
  ],
  url: "https://aws.amazon.com/certification/certified-ai-practitioner/",
};

const DEA_C01: Cert = {
  code: "DEA-C01",
  name: "AWS Certified Data Engineer – Associate",
  level: "Associate",
  questions: 65,
  minutes: 130,
  passingScore: 720,
  priceUsd: 150,
  proves:
    "That you can move data reliably — build the pipelines, model the storage, and keep the whole thing governed and queryable.",
  covers: [
    "Data ingestion and transformation pipelines",
    "Choosing and modelling data stores",
    "Operations, orchestration and monitoring of data workflows",
    "Data security, governance and quality",
  ],
  url: "https://aws.amazon.com/certification/certified-data-engineer-associate/",
};

const MLA_C01: Cert = {
  code: "MLA-C01",
  name: "AWS Certified Machine Learning Engineer – Associate",
  level: "Associate",
  questions: 65,
  minutes: 130,
  passingScore: 720,
  priceUsd: 150,
  proves:
    "That you can take a model from a notebook to production on AWS — prepare the data, train it, deploy it, and keep watching it afterwards.",
  covers: [
    "Data preparation for machine learning",
    "Model development, training and refinement",
    "Deployment and orchestration of ML workflows",
    "Monitoring, maintenance and securing ML solutions",
  ],
  url: "https://aws.amazon.com/certification/certified-machine-learning-engineer-associate/",
};

/* -------------------------------- roadmaps -------------------------------- */

export const ROADMAPS: Roadmap[] = [
  {
    slug: "solutions-architect",
    title: "The Architect",
    tagline: "Design systems that stay up.",
    forWho:
      "The default path, and the one most students should take first. If you want a cloud role and don't yet know which, start here.",
    accent: "#43B4FF",
    icon: Boxes,
    steps: [
      {
        cert: CLF_C02,
        why: "Everything else assumes this vocabulary. Two weekends here saves you a month of confusion later.",
        prep: "2–4 weeks from zero",
      },
      {
        cert: SAA_C03,
        why: "The certification employers actually recognise. It is the single highest-leverage exam on this page.",
        prep: "8–12 weeks after CLF-C02",
      },
      {
        cert: SAP_C02,
        why: "Only worth booking once you have real projects behind you. AWS recommends two years of hands-on experience.",
        prep: "3–6 months, with real workloads",
      },
    ],
  },
  {
    slug: "developer-devops",
    title: "The Builder",
    tagline: "Ship it, then keep it running.",
    forWho:
      "For students who already write code and would rather build the thing than diagram it. Strongest overlap with placement interviews for backend roles.",
    accent: "#FF9900",
    icon: Code2,
    steps: [
      {
        cert: CLF_C02,
        why: "Same starting point. You can move through it faster if you already know what a server and a database are.",
        prep: "2–3 weeks from zero",
      },
      {
        cert: DVA_C02,
        why: "Where your existing programming skill starts paying off — SDKs, IAM in code, pipelines, debugging.",
        prep: "8–10 weeks after CLF-C02",
      },
      {
        cert: DOP_C02,
        why: "The operations half: pipelines, observability and recovery. Book it after you have run something in production.",
        prep: "3–6 months, with pipeline experience",
      },
    ],
  },
  {
    slug: "ai-data",
    title: "The Data Path",
    tagline: "From prompts to pipelines to models.",
    forWho:
      "For students drawn to AI and data. Note that it branches: pick data engineering or ML engineering after the practitioner exam — you do not need both.",
    accent: "#AD5CFF",
    icon: BrainCircuit,
    steps: [
      {
        cert: AIF_C01,
        why: "The cheapest, fastest way to get the vocabulary right, and it covers generative AI and Bedrock properly.",
        prep: "2–4 weeks from zero",
      },
      {
        cert: DEA_C01,
        why: "Branch A. Take this if you like moving and modelling data more than training models.",
        prep: "10–12 weeks, SQL helps a lot",
      },
      {
        cert: MLA_C01,
        why: "Branch B. Take this if you want to own models in production. Python and some ML background assumed.",
        prep: "10–12 weeks, Python required",
      },
    ],
  },
];

/* ------------------------------ coming soon ------------------------------ */

export type ComingSoon = {
  title: string;
  blurb: string;
  icon: LucideIcon;
};

export const COMING_SOON: ComingSoon[] = [
  {
    title: "Security",
    blurb:
      "The specialty track around AWS Certified Security, plus the IAM and encryption depth it expects.",
    icon: ShieldCheck,
  },
  {
    title: "Networking",
    blurb:
      "Advanced Networking: VPC design at scale, hybrid connectivity, Direct Connect and Transit Gateway.",
    icon: Network,
  },
  {
    title: "Operations",
    blurb:
      "The SysOps Administrator route for students who want to run and monitor systems rather than design them.",
    icon: Terminal,
  },
  {
    title: "Beyond certification",
    blurb:
      "Project-based tracks — build and deploy something real — for students who would rather have a portfolio than a badge.",
    icon: Compass,
  },
];

/* --------------------------------- meta ---------------------------------- */

export const ROADMAP_LEDGER = [
  { value: String(ROADMAPS.length).padStart(2, "0"), label: "Paths" },
  {
    value: String(
      new Set(ROADMAPS.flatMap((r) => r.steps.map((s) => s.cert.code))).size,
    ).padStart(2, "0"),
    label: "Exams covered",
  },
  { value: "03", label: "Levels" },
  { value: "$100", label: "Cheapest start" },
];

/** Level styling, shared by the step cards and the legend. */
export const LEVEL_COLORS: Record<CertLevel, string> = {
  Foundational: "#2EE6A0",
  Associate: "#43B4FF",
  Professional: "#FF57EA",
};
