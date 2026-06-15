import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  FileWarning,
  Gauge,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type Metric = {
  label: string;
  value: string;
  change: string;
  tone: "good" | "watch" | "danger" | "neutral";
  icon: LucideIcon;
};

export type ActivityLog = {
  user: string;
  department: string;
  tool: string;
  prompt: string;
  risk: RiskLevel;
  score: number;
  timestamp: string;
  flags: string[];
};

export const navItems = [
  { label: "Dashboard", icon: Gauge },
  { label: "Activity Log", icon: MessageSquareText },
  { label: "Risk Engine", icon: ShieldCheck },
  { label: "Compliance", icon: ClipboardCheck },
  { label: "Training", icon: BookOpenCheck },
  { label: "Incidents", icon: FileWarning },
  { label: "Executive", icon: Building2 }
];

export const metrics: Metric[] = [
  {
    label: "AI interactions",
    value: "18,420",
    change: "+24% this month",
    tone: "neutral",
    icon: Activity
  },
  {
    label: "Active users",
    value: "642",
    change: "82% adoption",
    tone: "good",
    icon: UsersRound
  },
  {
    label: "Risk alerts",
    value: "73",
    change: "12 critical open",
    tone: "danger",
    icon: AlertTriangle
  },
  {
    label: "Policy coverage",
    value: "94%",
    change: "38 pending ack.",
    tone: "watch",
    icon: BadgeCheck
  }
];

export const activityLogs: ActivityLog[] = [
  {
    user: "Ava Chen",
    department: "Finance",
    tool: "ChatGPT",
    prompt: "Summarize cash flow variances for the confidential board deck.",
    risk: "High",
    score: 82,
    timestamp: "2026-06-09 09:42",
    flags: ["financial information", "company confidential"]
  },
  {
    user: "Marcus Reed",
    department: "Sales",
    tool: "Claude",
    prompt: "Draft a renewal email using the attached customer contract notes.",
    risk: "Medium",
    score: 61,
    timestamp: "2026-06-09 08:55",
    flags: ["customer data"]
  },
  {
    user: "Priya Shah",
    department: "Engineering",
    tool: "Cursor",
    prompt: "Generate tests for auth middleware without exposing secrets.",
    risk: "Low",
    score: 18,
    timestamp: "2026-06-08 17:18",
    flags: []
  },
  {
    user: "Noah Miller",
    department: "People",
    tool: "Gemini",
    prompt: "Analyze employee performance notes and list retention concerns.",
    risk: "Critical",
    score: 94,
    timestamp: "2026-06-08 14:06",
    flags: ["PII", "employee confidential"]
  }
];

export const departments = [
  { name: "Engineering", interactions: 6200, risk: 21 },
  { name: "Sales", interactions: 4100, risk: 18 },
  { name: "Finance", interactions: 2980, risk: 31 },
  { name: "People", interactions: 1840, risk: 24 },
  { name: "Legal", interactions: 1210, risk: 14 }
];

export const riskSignals = [
  { label: "Personally identifiable information", count: 28, level: "High" },
  { label: "Company confidential information", count: 19, level: "Critical" },
  { label: "Financial information", count: 16, level: "High" },
  { label: "Passwords and credentials", count: 5, level: "Critical" },
  { label: "Customer data", count: 37, level: "Medium" }
];

export const complianceItems = [
  { label: "AI policy published", value: "Current", progress: 100 },
  { label: "Employee acknowledgements", value: "94%", progress: 94 },
  { label: "Training completion", value: "87%", progress: 87 },
  { label: "Audit log retention", value: "365 days", progress: 100 }
];

export const trainingModules = [
  { title: "Safe prompt handling", audience: "All employees", completion: 91 },
  { title: "Customer data and AI", audience: "Sales and Support", completion: 84 },
  { title: "Financial data controls", audience: "Finance", completion: 78 },
  { title: "Developer AI safeguards", audience: "Engineering", completion: 89 }
];

export const incidents = [
  {
    title: "Customer contract pasted into public AI tool",
    owner: "Legal Ops",
    status: "Investigating",
    severity: "High"
  },
  {
    title: "Credential-like string detected in coding assistant prompt",
    owner: "Security",
    status: "Containment",
    severity: "Critical"
  },
  {
    title: "Policy exception requested for vendor research",
    owner: "Procurement",
    status: "Resolved",
    severity: "Medium"
  }
];

export const toolAdoption = [
  { name: "ChatGPT", value: 42 },
  { name: "Cursor", value: 24 },
  { name: "Claude", value: 19 },
  { name: "Gemini", value: 11 },
  { name: "Other", value: 4 }
];

export const integrations = [
  { name: "Supabase", purpose: "Auth, PostgreSQL, row-level policy storage", icon: LockKeyhole },
  { name: "OpenAI API", purpose: "Approved AI gateway and moderation workflow", icon: MessageSquareText }
];
