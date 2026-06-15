"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownUp,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  KeyRound,
  LockKeyhole,
  LogIn,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCog
} from "lucide-react";
import {
  activityLogs,
  complianceItems,
  departments,
  incidents,
  integrations,
  metrics,
  navItems,
  riskSignals,
  toolAdoption,
  trainingModules,
  type RiskLevel
} from "@/lib/data";

const riskStyles: Record<RiskLevel, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Medium: "bg-amber-50 text-amber-800 ring-amber-200",
  High: "bg-orange-50 text-orange-800 ring-orange-200",
  Critical: "bg-red-50 text-red-700 ring-red-200"
};

const toneStyles = {
  good: "text-emerald-700 bg-emerald-50 ring-emerald-200",
  watch: "text-amber-800 bg-amber-50 ring-amber-200",
  danger: "text-red-700 bg-red-50 ring-red-200",
  neutral: "text-stone-700 bg-stone-100 ring-stone-200"
};

export default function Home() {
  return (
    <main className="min-h-screen text-ink">
      <div className="mx-auto flex w-full max-w-[1480px] gap-4 px-4 py-4 lg:px-6">
        <aside className="hidden w-64 shrink-0 rounded-lg border border-stone-200 bg-white/88 p-3 shadow-panel lg:block">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="grid size-10 place-items-center rounded-md bg-ink text-white">
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">Vionix</p>
              <p className="mt-1 text-xs text-stone-500">AI governance gateway</p>
            </div>
          </div>

          <nav className="mt-5 space-y-1" aria-label="Main navigation">
            {navItems.map((item, index) => (
              <button
                key={item.label}
                className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm ${
                  index === 0
                    ? "bg-ink text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-ink"
                }`}
                type="button"
              >
                <item.icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 rounded-md border border-stone-200 bg-paper p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <LockKeyhole size={16} aria-hidden="true" />
              Controlled AI route
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
              <span>Employee</span>
              <span>Vionix</span>
              <span>AI tool</span>
            </div>
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-stone-400">
              <span className="h-2 rounded-full bg-signal" />
              <ArrowDownUp size={14} aria-hidden="true" />
              <span className="h-2 rounded-full bg-amberline" />
              <ArrowDownUp size={14} aria-hidden="true" />
              <span className="h-2 rounded-full bg-ink" />
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="rounded-lg border border-stone-200 bg-white/88 shadow-panel">
            <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-signal">Enterprise AI usage control</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal md:text-3xl">
                  Visibility, accountability, and risk management for AI at work
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50" type="button">
                  <Bell size={17} aria-hidden="true" />
                  Alerts
                </button>
                <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-white hover:bg-graphite" href="/login">
                  <LogIn size={17} aria-hidden="true" />
                  Admin login
                </Link>
                <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-stone-200 bg-white px-3 text-sm font-medium text-stone-700 hover:bg-stone-50" href="/signup">
                  Sign up
                </Link>
              </div>
            </div>

            <div className="grid border-t border-stone-200 md:grid-cols-3">
              <AuthPanel title="Company admin" icon={UserRoundCog} points={["Role-based permissions", "Policy and audit ownership", "Incident investigation workflow"]} />
              <AuthPanel title="Employee" icon={KeyRound} points={["Approved AI access", "Training and certification status", "Acknowledgement tracking"]} />
              <div className="p-4">
                <p className="text-sm font-semibold">Supported tools</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["ChatGPT", "Claude", "Gemini", "Cursor", "Other AI"].map((tool) => (
                    <span key={tool} className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="AI usage dashboard">
            {metrics.map((metric) => (
              <article key={metric.label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-stone-500">{metric.label}</p>
                  <span className={`grid size-9 place-items-center rounded-md ring-1 ${toneStyles[metric.tone]}`}>
                    <metric.icon size={18} aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                <p className="mt-1 text-sm text-stone-500">{metric.change}</p>
              </article>
            ))}
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <ActivityLog />
            <RiskEngine />
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-3">
            <DepartmentBreakdown />
            <ComplianceCenter />
            <EmployeeTraining />
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <IncidentManagement />
            <ExecutiveDashboard />
          </section>
        </section>
      </div>
    </main>
  );
}

function AuthPanel({
  title,
  icon: Icon,
  points
}: {
  title: string;
  icon: typeof UserRoundCog;
  points: string[];
}) {
  return (
    <div className="border-b border-stone-200 p-4 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon size={17} aria-hidden="true" />
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm text-stone-600">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 shrink-0 text-signal" size={15} aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase text-stone-500">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function ActivityLog() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
      <SectionHeader
        eyebrow="AI activity log"
        title="Attributed prompts, outputs, timestamps, and risk context"
        action={
          <div className="hidden gap-2 sm:flex">
            <IconButton label="Search">
              <Search size={17} aria-hidden="true" />
            </IconButton>
            <IconButton label="Filter">
              <Filter size={17} aria-hidden="true" />
            </IconButton>
          </div>
        }
      />
      <div className="mt-4 overflow-hidden rounded-md border border-stone-200">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.7fr] bg-stone-50 px-3 py-2 text-xs font-semibold uppercase text-stone-500">
          <span>User</span>
          <span>Tool</span>
          <span>Risk</span>
          <span>Time</span>
        </div>
        {activityLogs.map((log) => (
          <div key={`${log.user}-${log.timestamp}`} className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.7fr] gap-3 border-t border-stone-200 px-3 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium">{log.user}</p>
              <p className="truncate text-xs text-stone-500">{log.department}: {log.prompt}</p>
            </div>
            <p className="text-stone-600">{log.tool}</p>
            <div>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ${riskStyles[log.risk]}`}>
                {log.risk} {log.score}
              </span>
              <p className="mt-1 truncate text-xs text-stone-500">{log.flags.length ? log.flags.join(", ") : "No flags"}</p>
            </div>
            <p className="text-xs text-stone-500">{log.timestamp}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RiskEngine() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
      <SectionHeader
        eyebrow="Risk detection engine"
        title="Signals flagged before data reaches AI tools"
        action={
          <IconButton label="Tune detection">
            <SlidersHorizontal size={17} aria-hidden="true" />
          </IconButton>
        }
      />
      <div className="mt-4 space-y-3">
        {riskSignals.map((signal) => (
          <div key={signal.label} className="rounded-md border border-stone-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{signal.label}</p>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ring-1 ${riskStyles[signal.level as RiskLevel]}`}>
                {signal.level}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-stone-100">
              <div className="h-2 rounded-full bg-signal" style={{ width: `${Math.min(signal.count * 2, 100)}%` }} />
            </div>
            <p className="mt-2 text-xs text-stone-500">{signal.count} detections in the last 7 days</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DepartmentBreakdown() {
  const max = Math.max(...departments.map((department) => department.interactions));

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
      <SectionHeader eyebrow="Departments" title="Usage and risk breakdown" />
      <div className="mt-4 space-y-4">
        {departments.map((department) => (
          <div key={department.name}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{department.name}</span>
              <span className="text-stone-500">{department.risk} alerts</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-stone-100">
              <div className="h-2 rounded-full bg-amberline" style={{ width: `${(department.interactions / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComplianceCenter() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
      <SectionHeader eyebrow="Compliance center" title="Policy, acknowledgements, training, and audit readiness" />
      <div className="mt-4 space-y-3">
        {complianceItems.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-stone-500">{item.value}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-stone-100">
              <div className="h-2 rounded-full bg-signal" style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmployeeTraining() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
      <SectionHeader eyebrow="Employee training" title="Safety modules, quizzes, progress, certification" />
      <div className="mt-4 space-y-3">
        {trainingModules.map((module) => (
          <article key={module.title} className="rounded-md border border-stone-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{module.title}</p>
                <p className="mt-1 text-xs text-stone-500">{module.audience}</p>
              </div>
              <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
                {module.completion}%
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function IncidentManagement() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
      <SectionHeader
        eyebrow="Incident management"
        title="Misuse reports, investigations, and resolutions"
        action={
          <button className="inline-flex h-9 items-center gap-2 rounded-md bg-danger px-3 text-sm font-medium text-white hover:bg-red-800" type="button">
            <ShieldAlert size={16} aria-hidden="true" />
            Report
          </button>
        }
      />
      <div className="mt-4 space-y-3">
        {incidents.map((incident) => (
          <article key={incident.title} className="rounded-md border border-stone-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{incident.title}</p>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ring-1 ${riskStyles[incident.severity as RiskLevel]}`}>
                {incident.severity}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={13} aria-hidden="true" />
                {incident.status}
              </span>
              <span>{incident.owner}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExecutiveDashboard() {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
      <SectionHeader
        eyebrow="Executive dashboard"
        title="Adoption, tools, risk trends, compliance, and training completion"
        action={
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-stone-200 px-3 text-sm font-medium text-stone-700 hover:bg-stone-50" type="button">
            Month
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        }
      />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-stone-200 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">AI adoption rate</p>
            <span className="text-2xl font-semibold">82%</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-stone-100">
            <div className="h-2 rounded-full bg-signal" style={{ width: "82%" }} />
          </div>
        </div>
        <div className="rounded-md border border-stone-200 p-3">
          <p className="text-sm font-medium">Top AI tools used</p>
          <div className="mt-3 space-y-2">
            {toolAdoption.map((tool) => (
              <div key={tool.name} className="grid grid-cols-[70px_1fr_36px] items-center gap-2 text-xs">
                <span className="text-stone-600">{tool.name}</span>
                <div className="h-2 rounded-full bg-stone-100">
                  <div className="h-2 rounded-full bg-ink" style={{ width: `${tool.value * 2}%` }} />
                </div>
                <span className="text-right text-stone-500">{tool.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {integrations.map((integration) => (
          <div key={integration.name} className="flex gap-3 rounded-md border border-stone-200 p-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-md bg-stone-100 text-stone-700">
              <integration.icon size={17} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium">{integration.name}</p>
              <p className="mt-1 text-xs text-stone-500">{integration.purpose}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border border-stone-200 p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle size={16} className="text-amberline" aria-hidden="true" />
          Risk trend
        </div>
        <div className="mt-4 flex h-24 items-end gap-2">
          {[32, 48, 44, 58, 50, 67, 53, 46, 41, 38].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-sm bg-amberline/80" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </section>
  );
}

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      className="grid size-9 place-items-center rounded-md border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
      title={label}
      aria-label={label}
      type="button"
    >
      {children}
    </button>
  );
}
