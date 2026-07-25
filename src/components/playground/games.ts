import type { LucideIcon } from "lucide-react";
import {
  Braces,
  Brain,
  Crosshair,
  Layers,
  ScanSearch,
  Timer,
} from "lucide-react";

/**
 * Question banks for the Playground arcade. Every AWS fact here is checked
 * against how the service actually works — nothing is invented. Pools are
 * larger than a single round so replays stay fresh; each game samples from
 * its pool.
 */

/* ----------------------------- shared types ----------------------------- */

/** A multiple-choice item: pick the one correct option for the prompt. */
export type McqQuestion = {
  id: string;
  /** The description or scenario shown to the player. */
  prompt: string;
  /** The correct option, which must also appear in `options`. */
  answer: string;
  /** Exactly four choices, including `answer`. */
  options: readonly [string, string, string, string];
};

/** A true/false statement with the one-line reason behind the verdict. */
export type MythQuestion = {
  id: string;
  statement: string;
  /** true = the statement is a Fact, false = it's a Myth. */
  isFact: boolean;
  reason: string;
};

/* ----------------------------- game metadata ---------------------------- */

export type GameId =
  | "service-match"
  | "myth-or-fact"
  | "which-service"
  | "cloud-catch"
  | "memory-match"
  | "cloudle";

export type GameMeta = {
  id: GameId;
  title: string;
  teaches: string;
  blurb: string;
  accent: string;
  /** Questions asked per round. */
  rounds: number;
  bestKey: string;
  /** How the persisted best reads in the UI. */
  bestLabel: string;
  /** Shown as a chip on the arcade card. */
  difficulty: "Easy" | "Medium" | "Hard";
  /** Rough time for one run, shown as a chip. */
  duration: string;
  icon: LucideIcon;
  /**
   * True when the best score is a time or similar "lower is better" number, so
   * the card can label it correctly and the hub can skip it in point totals.
   */
  lowerIsBetter?: boolean;
};

export const GAMES: readonly GameMeta[] = [
  {
    id: "service-match",
    title: "Service Match",
    teaches: "Core services",
    blurb:
      "A one-line description lands, the clock starts. Say which AWS service it describes before time runs out — ten of them, back to back.",
    accent: "#FF9900",
    rounds: 10,
    bestKey: "awssbg:playground:service-match:best",
    bestLabel: "High score",
    difficulty: "Easy",
    duration: "~90s",
    icon: ScanSearch,
  },
  {
    id: "myth-or-fact",
    title: "Myth or Fact",
    teaches: "Cloud fundamentals",
    blurb:
      "A claim about the cloud appears. Call it Myth or Fact, then read the one-line reason. Miss one and the streak resets — how far can you get?",
    accent: "#FF57EA",
    rounds: 10,
    bestKey: "awssbg:playground:myth-or-fact:best",
    bestLabel: "Best streak",
    difficulty: "Easy",
    duration: "~2 min",
    icon: Brain,
  },
  {
    id: "which-service",
    title: "Which Service?",
    teaches: "Architecture sense",
    blurb:
      "A real situation, four services, one right call. Match the requirement to the tool the way you would in a design review. Eight rounds.",
    accent: "#43B4FF",
    rounds: 8,
    bestKey: "awssbg:playground:which-service:best",
    bestLabel: "High score",
    difficulty: "Medium",
    duration: "~2 min",
    icon: Layers,
  },
  {
    id: "cloud-catch",
    title: "Cloud Catch",
    teaches: "Service categories",
    blurb:
      "Service names rain down and one category is called out. Catch what belongs to it, dodge everything else. Three lives, and it only gets faster.",
    accent: "#2EE6A0",
    rounds: 60,
    bestKey: "awssbg:playground:cloud-catch:best",
    bestLabel: "High score",
    difficulty: "Hard",
    duration: "60s",
    icon: Crosshair,
  },
  {
    id: "memory-match",
    title: "Memory Match",
    teaches: "Recall drilling",
    blurb:
      "Sixteen face-down cards, eight services and the job each one does. Flip two at a time and pair them up. The clock is the only opponent.",
    accent: "#AD5CFF",
    rounds: 8,
    bestKey: "awssbg:playground:memory-match:best",
    bestLabel: "Best time",
    difficulty: "Medium",
    duration: "~2 min",
    icon: Braces,
    lowerIsBetter: true,
  },
  {
    id: "cloudle",
    title: "Cloudle",
    teaches: "Cloud vocabulary",
    blurb:
      "One five-letter cloud word, six guesses, a new word every day. Green means placed, amber means somewhere else. Keep the streak alive.",
    accent: "#43B4FF",
    rounds: 6,
    bestKey: "awssbg:playground:cloudle:streak",
    bestLabel: "Best streak",
    difficulty: "Medium",
    duration: "~3 min",
    icon: Timer,
  },
] as const;

/* --------------------------- Service Match pool ------------------------- */

export const SERVICE_MATCH: readonly McqQuestion[] = [
  {
    id: "sm-s3",
    prompt: "Object storage for files, backups, and static website assets.",
    answer: "S3",
    options: ["S3", "EC2", "RDS", "CloudFront"],
  },
  {
    id: "sm-lambda",
    prompt:
      "Run code in response to events with no servers to provision or manage.",
    answer: "Lambda",
    options: ["Lambda", "EC2", "ECS", "Batch"],
  },
  {
    id: "sm-ec2",
    prompt:
      "Resizable virtual servers you rent by the second to run any workload.",
    answer: "EC2",
    options: ["EC2", "S3", "Lambda", "VPC"],
  },
  {
    id: "sm-dynamodb",
    prompt:
      "A fully managed NoSQL key-value database with single-digit-millisecond latency.",
    answer: "DynamoDB",
    options: ["DynamoDB", "RDS", "Redshift", "ElastiCache"],
  },
  {
    id: "sm-rds",
    prompt:
      "Managed relational database that handles patching, backups, and failover for engines like PostgreSQL and MySQL.",
    answer: "RDS",
    options: ["RDS", "DynamoDB", "Redshift", "S3"],
  },
  {
    id: "sm-cloudfront",
    prompt:
      "A global content delivery network that caches content at edge locations close to users.",
    answer: "CloudFront",
    options: ["CloudFront", "Route 53", "S3", "ELB"],
  },
  {
    id: "sm-iam",
    prompt:
      "Manage users, groups, roles, and fine-grained permissions across your account.",
    answer: "IAM",
    options: ["IAM", "Cognito", "VPC", "KMS"],
  },
  {
    id: "sm-route53",
    prompt:
      "A managed DNS service that routes users to your application and registers domains.",
    answer: "Route 53",
    options: ["Route 53", "CloudFront", "VPC", "API Gateway"],
  },
  {
    id: "sm-vpc",
    prompt:
      "A logically isolated virtual network where you control subnets, route tables, and IP ranges.",
    answer: "VPC",
    options: ["VPC", "Route 53", "IAM", "Direct Connect"],
  },
  {
    id: "sm-sqs",
    prompt:
      "A managed message queue that decouples and buffers requests between application components.",
    answer: "SQS",
    options: ["SQS", "SNS", "Kinesis", "EventBridge"],
  },
  {
    id: "sm-cloudwatch",
    prompt:
      "Collect metrics and logs from your resources and fire alarms when thresholds are crossed.",
    answer: "CloudWatch",
    options: ["CloudWatch", "CloudTrail", "Config", "X-Ray"],
  },
  {
    id: "sm-elb",
    prompt:
      "Automatically distribute incoming traffic across multiple targets, such as EC2 instances.",
    answer: "Elastic Load Balancing",
    options: [
      "Elastic Load Balancing",
      "Auto Scaling",
      "Route 53",
      "CloudFront",
    ],
  },
] as const;

/* ---------------------------- Myth or Fact pool ------------------------- */

export const MYTH_OR_FACT: readonly MythQuestion[] = [
  {
    id: "mf-shared-responsibility",
    statement:
      "AWS secures everything in the cloud, so you don't have to worry about security.",
    isFact: false,
    reason:
      "The Shared Responsibility Model splits it: AWS secures the cloud itself, you secure what you put in it — data, IAM, and configuration.",
  },
  {
    id: "mf-s3-static",
    statement: "S3 can host a static website with no servers to manage.",
    isFact: true,
    reason:
      "S3 static website hosting serves HTML, CSS, and JavaScript straight from a bucket — no EC2 instance required.",
  },
  {
    id: "mf-lambda-timeout",
    statement: "A Lambda function can keep running for as long as you need.",
    isFact: false,
    reason:
      "A single Lambda invocation is capped at a 15-minute timeout; longer-running work needs a different service.",
  },
  {
    id: "mf-ec2-stopped",
    statement: "A stopped EC2 instance still bills you for compute time.",
    isFact: false,
    reason:
      "You stop paying for instance compute while it's stopped — though attached EBS volumes keep costing money.",
  },
  {
    id: "mf-cloud-cheaper",
    statement:
      "Moving to the cloud always costs less than running your own servers.",
    isFact: false,
    reason:
      "The cloud trades capital cost for elasticity, but idle or oversized resources can cost more — savings come from right-sizing.",
  },
  {
    id: "mf-region-az",
    statement:
      "A Region and an Availability Zone are two names for the same thing.",
    isFact: false,
    reason:
      "A Region is a geographic area; each Region contains multiple isolated Availability Zones, which are separate data centers.",
  },
  {
    id: "mf-multi-az",
    statement:
      "Spreading resources across multiple Availability Zones improves fault tolerance.",
    isFact: true,
    reason:
      "AZs are physically separate, so an app spread across them keeps running even if one zone fails.",
  },
  {
    id: "mf-root-daily",
    statement: "It's fine to use the AWS root account for everyday work.",
    isFact: false,
    reason:
      "The root user has unrestricted access; best practice is to lock it away and work through least-privilege IAM roles and users.",
  },
  {
    id: "mf-bucket-region",
    statement: "An S3 bucket lives in the single Region where you created it.",
    isFact: true,
    reason:
      "A bucket is tied to one Region and stays there unless you deliberately set up cross-region replication.",
  },
  {
    id: "mf-glacier",
    statement:
      "You can cut storage costs by moving rarely-accessed data to S3 Glacier.",
    isFact: true,
    reason:
      "Glacier storage classes are built for archival: far cheaper per GB in exchange for slower retrieval times.",
  },
  {
    id: "mf-autoscaling",
    statement:
      "Auto Scaling can add and remove EC2 instances as demand changes.",
    isFact: true,
    reason:
      "EC2 Auto Scaling adjusts capacity against your policies — adding instances under load and removing them when idle.",
  },
  {
    id: "mf-https-auto",
    statement:
      "AWS encrypts HTTPS traffic to your site automatically with no setup.",
    isFact: false,
    reason:
      "Encryption in transit isn't automatic — you provision and attach a TLS certificate, for example through ACM.",
  },
] as const;

/* --------------------------- Which Service? pool ------------------------ */

export const WHICH_SERVICE: readonly McqQuestion[] = [
  {
    id: "ws-lambda",
    prompt:
      "You need to run a small piece of code every time a file is uploaded to a bucket, with no servers to manage.",
    answer: "Lambda",
    options: ["Lambda", "EC2", "ECS", "Batch"],
  },
  {
    id: "ws-rds",
    prompt:
      "Your app needs a managed relational database for PostgreSQL, with automatic backups and failover.",
    answer: "RDS",
    options: ["RDS", "DynamoDB", "Redshift", "S3"],
  },
  {
    id: "ws-s3",
    prompt:
      "You want to store users' uploaded photos cheaply and serve them as static objects.",
    answer: "S3",
    options: ["S3", "EBS", "EFS", "RDS"],
  },
  {
    id: "ws-cloudfront",
    prompt:
      "Users worldwide say your site is slow, and you want to cache assets close to them.",
    answer: "CloudFront",
    options: ["CloudFront", "Route 53", "ELB", "VPC"],
  },
  {
    id: "ws-iam",
    prompt:
      "You need to control which teammates can access which AWS resources, using roles and policies.",
    answer: "IAM",
    options: ["IAM", "Cognito", "VPC", "KMS"],
  },
  {
    id: "ws-cognito",
    prompt:
      "Your mobile app needs sign-up, sign-in, and a user directory for its end users.",
    answer: "Cognito",
    options: ["Cognito", "IAM", "SNS", "SES"],
  },
  {
    id: "ws-sqs",
    prompt:
      "Two services must talk reliably, and you want to buffer messages so a traffic spike doesn't overwhelm the consumer.",
    answer: "SQS",
    options: ["SQS", "SNS", "Kinesis", "API Gateway"],
  },
  {
    id: "ws-sns",
    prompt:
      "You want to fan out a single notification to thousands of subscribers at once.",
    answer: "SNS",
    options: ["SNS", "SQS", "SES", "CloudWatch"],
  },
  {
    id: "ws-ecs",
    prompt:
      "You need to run long-lived containers and orchestrate them across a cluster.",
    answer: "ECS",
    options: ["ECS", "Lambda", "EC2", "S3"],
  },
  {
    id: "ws-redshift",
    prompt:
      "You need a data warehouse to run complex analytical queries over terabytes of data.",
    answer: "Redshift",
    options: ["Redshift", "RDS", "DynamoDB", "ElastiCache"],
  },
] as const;

/* -------------------------------- helpers ------------------------------- */

/** Fisher–Yates shuffle that returns a new array; guards element access. */
export function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const ai = a[i];
    const aj = a[j];
    if (ai !== undefined && aj !== undefined) {
      a[i] = aj;
      a[j] = ai;
    }
  }
  return a;
}

/** Take up to `n` items from a freshly shuffled copy of the pool. */
export function sample<T>(pool: readonly T[], n: number): T[] {
  return shuffle(pool).slice(0, n);
}

/* ---------------------------- Cloud Catch pool --------------------------- */

export const CATCH_CATEGORIES = [
  "Storage",
  "Compute",
  "Database",
  "Networking",
  "Security",
] as const;

export type CatchCategory = (typeof CATCH_CATEGORIES)[number];

export type CatchService = {
  name: string;
  category: CatchCategory;
};

/**
 * Services grouped by the category AWS itself files them under. Eight per
 * category keeps every round winnable no matter which one is called.
 */
export const CATCH_SERVICES: readonly CatchService[] = [
  { name: "S3", category: "Storage" },
  { name: "EBS", category: "Storage" },
  { name: "EFS", category: "Storage" },
  { name: "FSx", category: "Storage" },
  { name: "S3 Glacier", category: "Storage" },
  { name: "Storage Gateway", category: "Storage" },
  { name: "Snowball", category: "Storage" },
  { name: "AWS Backup", category: "Storage" },

  { name: "EC2", category: "Compute" },
  { name: "Lambda", category: "Compute" },
  { name: "Fargate", category: "Compute" },
  { name: "ECS", category: "Compute" },
  { name: "EKS", category: "Compute" },
  { name: "AWS Batch", category: "Compute" },
  { name: "Lightsail", category: "Compute" },
  { name: "App Runner", category: "Compute" },

  { name: "RDS", category: "Database" },
  { name: "DynamoDB", category: "Database" },
  { name: "Aurora", category: "Database" },
  { name: "Redshift", category: "Database" },
  { name: "ElastiCache", category: "Database" },
  { name: "DocumentDB", category: "Database" },
  { name: "Neptune", category: "Database" },
  { name: "Timestream", category: "Database" },

  { name: "VPC", category: "Networking" },
  { name: "Route 53", category: "Networking" },
  { name: "CloudFront", category: "Networking" },
  { name: "API Gateway", category: "Networking" },
  { name: "Load Balancing", category: "Networking" },
  { name: "Direct Connect", category: "Networking" },
  { name: "Transit Gateway", category: "Networking" },
  { name: "Global Accelerator", category: "Networking" },

  { name: "IAM", category: "Security" },
  { name: "KMS", category: "Security" },
  { name: "Shield", category: "Security" },
  { name: "WAF", category: "Security" },
  { name: "GuardDuty", category: "Security" },
  { name: "Secrets Manager", category: "Security" },
  { name: "Cognito", category: "Security" },
  { name: "Inspector", category: "Security" },
] as const;

/* --------------------------- Memory Match pool --------------------------- */

/** One service paired with the job it does — the two halves of a match. */
export type MemoryPair = {
  id: string;
  service: string;
  job: string;
};

export const MEMORY_PAIRS: readonly MemoryPair[] = [
  { id: "mm-s3", service: "S3", job: "Object storage" },
  { id: "mm-ec2", service: "EC2", job: "Virtual servers" },
  { id: "mm-lambda", service: "Lambda", job: "Run code, no servers" },
  { id: "mm-rds", service: "RDS", job: "Managed SQL database" },
  { id: "mm-dynamodb", service: "DynamoDB", job: "NoSQL key-value store" },
  { id: "mm-cloudfront", service: "CloudFront", job: "Global CDN" },
  { id: "mm-route53", service: "Route 53", job: "DNS and domains" },
  { id: "mm-vpc", service: "VPC", job: "Isolated virtual network" },
  { id: "mm-iam", service: "IAM", job: "Users and permissions" },
  { id: "mm-sqs", service: "SQS", job: "Message queue" },
  { id: "mm-cloudwatch", service: "CloudWatch", job: "Metrics, logs, alarms" },
  { id: "mm-kms", service: "KMS", job: "Encryption keys" },
  { id: "mm-redshift", service: "Redshift", job: "Data warehouse" },
  { id: "mm-eks", service: "EKS", job: "Managed Kubernetes" },
] as const;

/* ------------------------------ Cloudle pool ----------------------------- */

/** A five-letter answer plus the one-line reason it belongs in a cloud game. */
export type CloudleWord = {
  word: string;
  hint: string;
};

/** Every entry is exactly five letters — the grid depends on it. */
export const CLOUDLE_WORDS: readonly CloudleWord[] = [
  { word: "CLOUD", hint: "Someone else's computer, rented by the hour." },
  { word: "SCALE", hint: "Add capacity as demand grows — up, out, or both." },
  { word: "STACK", hint: "What CloudFormation deploys as one unit." },
  { word: "QUEUE", hint: "What SQS holds so producers outrun consumers." },
  { word: "CACHE", hint: "Keep the answer close so you don't recompute it." },
  { word: "PROXY", hint: "Sits in front and forwards the request onward." },
  { word: "TOKEN", hint: "Short-lived proof that you are who you claim." },
  { word: "VAULT", hint: "Where secrets live instead of in your source code." },
  { word: "SHARD", hint: "One slice of a dataset split across nodes." },
  { word: "BATCH", hint: "Work queued up and processed together, not live." },
  { word: "ROUTE", hint: "The path a packet takes — see also table, 53." },
  { word: "IMAGE", hint: "The frozen template an instance boots from." },
  { word: "INDEX", hint: "The structure that stops a full table scan." },
  { word: "PATCH", hint: "The update that closes the vulnerability." },
  { word: "NODES", hint: "The members of your cluster." },
  { word: "REDIS", hint: "The in-memory store behind ElastiCache." },
  { word: "LINUX", hint: "What most EC2 instances are running." },
  { word: "NGINX", hint: "Web server and reverse proxy, everywhere." },
  { word: "QUOTA", hint: "The ceiling AWS puts on a resource per account." },
  { word: "TRACE", hint: "Follow one request across every service it hits." },
  { word: "ALARM", hint: "What CloudWatch raises when a threshold breaks." },
  { word: "QUERY", hint: "The request you send a database." },
  { word: "LAYER", hint: "Shared code Lambda functions can pull in." },
  { word: "BYTES", hint: "What egress charges are measured in." },
  { word: "BLOCK", hint: "The storage type EBS gives you." },
  { word: "TIERS", hint: "S3 has several, and they price very differently." },
  { word: "ADMIN", hint: "The role you should not use day to day." },
  { word: "MOUNT", hint: "What you do to an EFS file system." },
  { word: "GRAPH", hint: "The data model Neptune is built for." },
  { word: "LIMIT", hint: "Rate ceiling an API Gateway stage enforces." },
] as const;

/**
 * The word of the day, identical for everyone in the same local date. Uses the
 * local calendar date so the puzzle turns over at the player's midnight.
 */
export function cloudleWordForDate(date: Date): CloudleWord {
  const days = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  const index =
    ((days % CLOUDLE_WORDS.length) + CLOUDLE_WORDS.length) %
    CLOUDLE_WORDS.length;
  // The modulo above keeps this in range; the fallback satisfies strict index
  // checking without ever being reached.
  return CLOUDLE_WORDS[index] ?? { word: "CLOUD", hint: "Fallback word." };
}
