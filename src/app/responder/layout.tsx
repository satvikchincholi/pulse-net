import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogOut, Map, List, ShieldAlert, Award, TrendingUp, Briefcase, Zap } from "lucide-react";
import Link from "next/link";
import SimulateMonthEndButton from "@/components/SimulateMonthEndButton";

export default async function ResponderLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/responder/login");
  }

  const { data: official } = await supabase
    .from("municipal_officials")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!official) {
    redirect("/citizen/feed");
  }

  // Helper for tier styling
  const tierColor = {
    bronze: "text-amber-600 bg-amber-600/10 border-amber-600/20",
    silver: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    gold: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    diamond: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  }[official.current_tier as 'bronze' | 'silver' | 'gold' | 'diamond'] || "text-slate-400";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-emerald-950/40 border-r border-slate-200 dark:border-emerald-900/30 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-emerald-900/30 flex items-center gap-3">
          <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/20 dark:border-emerald-500/30">
            <ShieldAlert className="text-emerald-650 dark:text-emerald-400" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-slate-850 dark:text-white tracking-tight leading-tight">Responder<br/>Dashboard</h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Link href="/responder/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 hover:text-emerald-650 dark:hover:text-emerald-400 font-medium transition">
            <Map size={18} />
            Bounty Map
          </Link>
          <Link href="/responder/jobs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 hover:text-emerald-650 dark:hover:text-emerald-400 font-medium transition">
            <List size={18} />
            Active Jobs
          </Link>
        </nav>

        {/* Performance Panel Widget */}
        <div className="mt-auto p-4">
          <div className="bg-slate-100/50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Performance</div>
              <Award size={16} className="text-slate-500" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">Current Tier</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border uppercase ${tierColor}`}>
                  {official.current_tier}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">Monthly Res.</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">{official.monthly_resolutions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">Comp. Score</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white">{official.composite_score.toFixed(1)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-sm text-emerald-650 dark:text-emerald-400">
                  <Briefcase size={14} />
                  <span>Wallet</span>
                </div>
                <span className="text-sm font-bold text-emerald-655 dark:text-emerald-400">{official.help_coin_wallet} HC</span>
              </div>
            </div>
          </div>

          <div className="mt-4 px-2 py-3 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium text-slate-850 dark:text-slate-200 truncate max-w-[140px]">{official.employee_id}</div>
              <div className="text-xs text-slate-550 truncate max-w-[140px]">{official.department}</div>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-slate-400 hover:text-red-500 transition" aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </form>
          </div>
          
          {/* Developer Testing Tools */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-emerald-900/30">
            <SimulateMonthEndButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
