// src/app/citizen/dashboard/page.tsx
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PlusSquare,
  Heart,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function CitizenDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch this citizen's tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  // Stats
  const total = tickets?.length ?? 0;
  const resolved = tickets?.filter((t) => t.status === "resolved").length ?? 0;
  const open = tickets?.filter((t) => t.status === "open").length ?? 0;
  const claimed = tickets?.filter((t) => t.status === "claimed").length ?? 0;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Welcome back, {user.email?.split("@")[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-2 text-sm md:text-base font-medium">
            Your civic impact dashboard — PulseNet
          </p>
        </div>
        <Link
          href="/citizen/report"
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-black shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-slate-800 dark:hover:bg-white/90 transition w-full md:w-auto shrink-0"
        >
          <PlusSquare size={18} />
          New Report
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          {
            label: "Total Reports",
            value: total,
            icon: Activity,
            color: "text-cyan-600 dark:text-cyan-400",
            bg: "bg-cyan-500/10 border-cyan-500/20",
          },
          {
            label: "Open",
            value: open,
            icon: AlertTriangle,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
          },
          {
            label: "In Progress",
            value: claimed,
            icon: Clock,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-500/10 border-indigo-500/20",
          },
          {
            label: "Resolved",
            value: resolved,
            icon: CheckCircle2,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className={`rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 flex flex-col gap-4 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] transition-all hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/20`}
          >
            <div className={`p-3 rounded-2xl w-fit ${bg}`}>
              <Icon size={24} className={color} />
            </div>
            <div>
              <p className="text-4xl font-extralight text-slate-900 dark:text-white mb-1">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/50 font-bold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket List */}
      <div>
        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-6">Your Reports</h2>

        {!tickets || tickets.length === 0 ? (
          <div className="rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-12 text-center shadow-xl dark:shadow-none">
            <Activity size={48} className="mx-auto mb-4 text-slate-300 dark:text-white/20" />
            <p className="text-slate-500 dark:text-white/50 font-medium">
              You haven&apos;t reported any issues yet.
            </p>
            <Link
              href="/citizen/report"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-200/50 dark:bg-white/10 px-6 py-3 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-300/50 dark:hover:bg-white/20 transition border border-slate-300/50 dark:border-white/10"
            >
              <PlusSquare size={16} />
              File your first report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="group rounded-[2rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 flex items-start gap-5 hover:border-slate-300 dark:hover:border-white/30 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 shadow-lg dark:shadow-none"
              >
                {/* Status icon */}
                <div className="mt-1 shrink-0 p-3 rounded-2xl bg-slate-100/50 dark:bg-black/40 border border-slate-300/50 dark:border-white/5 shadow-inner">
                  {ticket.status === "resolved" ? (
                    <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                  ) : ticket.status === "claimed" ? (
                    <Clock size={24} className="text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <AlertTriangle size={24} className="text-amber-600 dark:text-amber-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      {ticket.category}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                        ticket.status === "resolved"
                          ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30"
                          : ticket.status === "claimed"
                          ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30"
                          : "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30"
                      }`}
                    >
                      {ticket.status === "claimed" ? "In Progress" : ticket.status}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-white/70 border border-slate-300/50 dark:border-white/10">
                      {ticket.severity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-white/50 mt-3 line-clamp-2 leading-relaxed">
                    {ticket.description}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-6 gap-y-3 mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-white/60">
                      <MapPin size={14} />
                      {ticket.reported_area || "Unknown"}
                    </span>
                    <span className="flex items-center gap-1.5 text-pink-500 dark:text-pink-400">
                      <Heart size={14} className="fill-pink-500/20 dark:fill-pink-400/20" />
                      {ticket.upvote_count} upvotes
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                      {ticket.bounty_amount} HC
                    </span>
                    <span>
                      {formatDistanceToNow(new Date(ticket.created_at))} ago
                    </span>
                  </div>
                </div>

                {/* Before image thumbnail */}
                {ticket.before_image_url && (
                  <img
                    src={ticket.before_image_url}
                    alt="Report"
                    className="h-24 w-24 rounded-2xl object-cover shrink-0 border border-slate-300/50 dark:border-white/10 bg-slate-200/50 dark:bg-black/40 group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
