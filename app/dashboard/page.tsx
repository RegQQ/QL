"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Building2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import { roleLabels, type Role } from "@/lib/auth/roles";

type Membership = {
  role: Role;
  organizations: {
    name: string;
    slug: string;
  } | null;
};

type Profile = {
  full_name: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const hasSupabaseConfig = hasSupabaseBrowserConfig();
  const supabase = useMemo(() => (hasSupabaseConfig ? createSupabaseBrowserClient() : null), [hasSupabaseConfig]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    async function loadSession() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login?redirectTo=/dashboard");
        return;
      }

      setEmail(data.session.user.email ?? "");

      const [{ data: profileData }, { data: membershipData }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", data.session.user.id).maybeSingle(),
        supabase
          .from("organization_members")
          .select("role, organizations(name, slug)")
          .eq("user_id", data.session.user.id)
          .eq("status", "active")
          .maybeSingle()
      ]);

      setProfile(profileData);
      setMembership(membershipData as Membership | null);
      setLoading(false);
    }

    loadSession();
  }, [router, supabase]);

  async function handleLogout() {
    if (!supabase) {
      router.replace("/login");
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="rounded-lg border border-stone-200 bg-white p-6 text-sm text-stone-500 shadow-panel">
          Loading your QL Trade workspace...
        </div>
      </main>
    );
  }

  if (!hasSupabaseConfig) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-panel">
          <h1 className="text-xl font-semibold">Supabase setup required</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, then restart the dev server.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 text-ink lg:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-panel md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-md bg-ink text-white">
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-none">QL Trade</p>
              <p className="mt-1 text-sm text-stone-500">Organization workspace</p>
            </div>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={17} aria-hidden="true" />
            Log out
          </button>
        </header>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          <SummaryCard icon={Building2} label="Organization" value={membership?.organizations?.name ?? "No organization"} />
          <SummaryCard icon={UserRound} label="Signed in as" value={profile?.full_name || email} />
          <SummaryCard icon={ShieldCheck} label="Role" value={membership ? roleLabels[membership.role] : "Unassigned"} />
        </section>

        <section className="mt-4 rounded-lg border border-stone-200 bg-white p-5 shadow-panel">
          <p className="text-sm font-semibold text-signal">Authenticated MVP shell</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">Trading automation workspace</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Authentication, organization accounts, and Admin/Employee roles are ready. The next product modules can now sit behind this workspace boundary.
          </p>
          <div className="mt-5">
            <Link className="inline-flex h-10 items-center rounded-md bg-ink px-3 text-sm font-medium text-white hover:bg-graphite" href="/">
              View public dashboard concept
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-panel">
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Icon size={17} aria-hidden="true" />
        {label}
      </div>
      <p className="mt-3 truncate text-xl font-semibold">{value}</p>
    </article>
  );
}
