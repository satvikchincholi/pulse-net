"use client";

import { AlertCircle, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const severityConfig = {
  low: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Low", baseBounty: 25 },
  medium: { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Medium", baseBounty: 50 },
  high: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", label: "High", baseBounty: 100 },
  critical: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Critical", baseBounty: 200 }
};

export default function OpenTicketList({ tickets, onSelectTicket, selectedId }: { tickets: any[], onSelectTicket: (t: any) => void, selectedId?: string }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 p-8 text-center">
        <div className="bg-slate-800 p-4 rounded-full">
          <AlertCircle size={32} className="text-slate-600" />
        </div>
        <p>No open tickets in your jurisdiction.</p>
        <p className="text-sm">You are caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 overflow-y-auto h-full">
      {tickets.map((ticket) => {
        const sev = severityConfig[ticket.severity as keyof typeof severityConfig] || severityConfig.low;
        const totalBounty = sev.baseBounty + (ticket.bounty_amount || 0);
        const isSelected = selectedId === ticket.id;

        return (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className={`
              cursor-pointer rounded-xl border p-4 transition-all duration-200
              ${isSelected 
                ? "bg-slate-800 border-emerald-500 shadow-md shadow-emerald-900/20" 
                : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-slate-200 line-clamp-1">{ticket.category}</h3>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${sev.color} ${sev.bg} ${sev.border}`}>
                  {sev.label}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  {totalBounty} HC
                </span>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 line-clamp-2 mb-3 leading-relaxed">
              {ticket.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-3 border-t border-slate-800/50">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate max-w-[120px]">{ticket.reported_area || "Unknown Location"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
