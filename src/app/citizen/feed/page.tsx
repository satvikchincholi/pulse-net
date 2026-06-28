"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { upvoteTicket } from "@/app/actions/citizenActions";
import { formatDistanceToNow } from "date-fns";
import { Heart, MapPin, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export default function CitizenFeedPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tickets")
      .select(`
        *,
        author:author_id(email),
        solver:solver_id(email, department)
      `)
      .order("created_at", { ascending: false });

    if (data) setTickets(data);
    setLoading(false);
  };

  const handleUpvote = async (ticketId: string) => {
    setUpvoting(prev => ({ ...prev, [ticketId]: true }));
    const res = await upvoteTicket(ticketId);
    
    if (res.success) {
      // Optimistically update
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, upvote_count: t.upvote_count + 1, bounty_amount: t.bounty_amount + 5 } : t
      ));
    } else {
      alert(res.error);
    }
    
    setUpvoting(prev => ({ ...prev, [ticketId]: false }));
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="max-w-md mx-auto space-y-6 pt-4 pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight">Community Feed</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Live updates from your civic network</p>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-white/50 animate-pulse font-bold text-sm">Loading local feed...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-white/50 flex flex-col items-center rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-none">
            <ShieldAlert size={48} className="mb-4 text-slate-300 dark:text-white/20" />
            <p className="font-bold">No issues reported in your area yet.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <article key={ticket.id} className="rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 overflow-hidden shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]">
              {/* Header */}
              <div className="p-5 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-mono font-extrabold text-sm text-white dark:text-black shadow-lg">
                    {ticket.author?.email?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <h3 className="font-manrope font-extrabold text-base tracking-tight text-slate-900 dark:text-white">{ticket.is_anonymous ? 'Anonymous Node' : (ticket.author?.email?.split('@')[0] || 'Citizen Node')}</h3>
                    <p className="font-mono text-[10px] text-slate-500 dark:text-white/50 flex items-center gap-1 font-bold uppercase tracking-widest mt-0.5">
                      <MapPin size={10} /> {ticket.reported_area || "Unknown Location"}
                    </p>
                  </div>
                </div>
                
                {ticket.status === 'open' && (
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-white/70 border border-slate-300/50 dark:border-white/10">
                    Open
                  </span>
                )}
                {ticket.status === 'claimed' && (
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30">
                    In Progress
                  </span>
                )}
                {ticket.status === 'resolved' && (
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Fixed
                  </span>
                )}
              </div>

              {/* Image */}
              <div className="w-full aspect-square bg-slate-200/50 dark:bg-black/40 relative">
                {ticket.status === 'resolved' && ticket.after_image_url ? (
                  <img 
                    src={ticket.after_image_url} 
                    alt="Resolved" 
                    className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/020617/22d3ee?text=Image+Not+Found'; }}
                  />
                ) : (
                  <img 
                    src={ticket.before_image_url || 'https://placehold.co/600x600/020617/22d3ee?text=No+Image'} 
                    alt="Issue" 
                    className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/020617/22d3ee?text=Image+Not+Found'; }}
                  />
                )}
                
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/80 dark:bg-black/60 backdrop-blur-2xl rounded-xl border border-slate-200/80 dark:border-white/10 font-mono text-[10px] font-bold text-slate-900 dark:text-white shadow-xl uppercase tracking-widest">
                  {ticket.severity} PRIORITY
                </div>
              </div>

              {/* Worker Recognition Banner */}
              {ticket.status === 'resolved' && ticket.solver && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-extrabold text-xs border border-emerald-500/30">
                    {ticket.solver.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-emerald-500/60">Resolved by </span>
                    <span className="text-emerald-400">{ticket.solver.email?.split('@')[0]}</span>
                    <span className="text-emerald-500/40 ml-1">({ticket.solver.department})</span>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5">
                <button 
                  onClick={() => handleUpvote(ticket.id)}
                  disabled={upvoting[ticket.id] || ticket.status === 'resolved'}
                  className={`flex items-center gap-1.5 transition ${ticket.status === 'resolved' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                >
                  <Heart 
                    size={28} 
                    className={ticket.upvote_count > 0 ? "fill-pink-500 text-pink-500" : "text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/50"} 
                  />
                </button>
                
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-4 py-2 rounded-2xl border border-cyan-500/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)] dark:shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                  Bounty: {ticket.bounty_amount} HC
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-4 space-y-2">
                <div className="font-manrope font-extrabold tracking-tight text-sm text-slate-900 dark:text-white">
                  {ticket.upvote_count} {ticket.upvote_count === 1 ? 'upvote' : 'upvotes'}
                </div>
                <p className="text-sm text-slate-700 dark:text-white/70 leading-relaxed">
                  <span className="font-manrope font-extrabold tracking-tight text-slate-900 dark:text-white mr-2">{ticket.category}</span>
                  {ticket.description}
                </p>
                <p className="font-mono text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-widest pt-2">
                  {formatDistanceToNow(new Date(ticket.created_at))} ago
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
