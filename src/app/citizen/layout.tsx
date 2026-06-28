import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogOut, Home, PlusSquare, User, Activity, AlertCircle, Heart } from "lucide-react";
import Link from "next/link";

export default async function CitizenLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch some basic stats for the citizen
  const { count: reportsCount } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id);

  const { count: upvotesCount } = await supabase
    .from("ticket_upvotes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white selection:bg-cyan-500/30 font-sans overflow-hidden transition-colors duration-300 relative">
      
      {/* Background Watermorphism Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-300/30 dark:bg-cyan-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[100px] dark:blur-[120px] animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[100px] dark:blur-[120px] animate-[float_12s_ease-in-out_infinite_reverse]" />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}} />

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-72 bg-white/60 dark:bg-white/5 backdrop-blur-2xl border-r border-slate-200/50 dark:border-white/10 flex-col z-10 relative">
        <div className="p-6 border-b border-slate-200/50 dark:border-white/10 flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-2xl border border-cyan-500/20">
            <Activity className="text-cyan-600 dark:text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="font-black text-slate-900 dark:text-white tracking-tighter leading-tight text-xl">Citizen<br/>Node</h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Link href="/citizen/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition">
            <Home size={18} />
            Dashboard
          </Link>
          <Link href="/citizen/feed" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition">
            <Activity size={18} />
            Community Feed
          </Link>
          <Link href="/citizen/report" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition">
            <PlusSquare size={18} />
            Report Issue
          </Link>
          <Link href="/citizen/communities" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition">
            <Activity size={18} />
            Communities
          </Link>
          <Link href="/citizen/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-bold text-sm transition">
            <User size={18} />
            My Profile
          </Link>
        </nav>

        {/* Citizen Impact Widget */}
        <div className="mt-auto p-4">
          <div className="bg-slate-100/50 dark:bg-black/20 border border-slate-300/50 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-inner dark:shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/50 dark:border-white/10">
              <div className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">Civic Impact</div>
              <Heart size={16} className="text-pink-500" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 dark:text-white/50">Reports</span>
                <span className="text-lg font-extralight text-slate-900 dark:text-white">{reportsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 dark:text-white/50">Upvotes</span>
                <span className="text-lg font-extralight text-slate-900 dark:text-white">{upvotesCount || 0}</span>
              </div>
              <div className="pt-3 border-t border-slate-300/50 dark:border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <AlertCircle size={14} />
                  <span>Reputation</span>
                </div>
                <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase">Solid</span>
              </div>
            </div>
          </div>

          <div className="mt-6 px-2 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{user.email?.split('@')[0]}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 truncate max-w-[140px]">Verified Node</div>
            </div>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-slate-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition" aria-label="Sign out">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col h-[calc(100vh-4rem)] md:h-screen overflow-y-auto mb-16 md:mb-0 z-10">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="text-cyan-600 dark:text-cyan-400" size={20} />
            <h2 className="font-black text-slate-900 dark:text-white tracking-tighter">Citizen Node</h2>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/50">
            {user.email?.split('@')[0]}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-0">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/40 backdrop-blur-3xl border-t border-slate-200/50 dark:border-white/10 flex justify-around p-3 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        <Link href="/citizen/dashboard" className="flex flex-col items-center gap-1 text-slate-500 dark:text-white/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition">
          <Home size={20} />
          <span className="text-[10px] font-bold">Dashboard</span>
        </Link>
        <Link href="/citizen/feed" className="flex flex-col items-center gap-1 text-slate-500 dark:text-white/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition">
          <Activity size={20} />
          <span className="text-[10px] font-bold">Feed</span>
        </Link>
        <Link href="/citizen/report" className="flex flex-col items-center gap-1 text-slate-500 dark:text-white/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition">
          <PlusSquare size={20} />
          <span className="text-[10px] font-bold">Report</span>
        </Link>
        <Link href="/citizen/communities" className="flex flex-col items-center gap-1 text-slate-500 dark:text-white/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition">
          <Activity size={20} />
          <span className="text-[10px] font-bold">Hub</span>
        </Link>
        <form action="/auth/signout" method="post" className="flex flex-col items-center gap-1 text-slate-500 dark:text-white/50 hover:text-red-500 dark:hover:text-red-400 transition">
          <button type="submit" className="flex flex-col items-center gap-1">
            <LogOut size={20} />
            <span className="text-[10px] font-bold">Sign Out</span>
          </button>
        </form>
      </nav>
    </div>
  );
}
