"use client";

import { X, MapPin, Clock, ShieldAlert, Image as ImageIcon, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { claimTicket } from "@/app/actions/ticketActions";

const severityConfig = {
  low: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Low", baseBounty: 25 },
  medium: { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "Medium", baseBounty: 50 },
  high: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", label: "High", baseBounty: 100 },
  critical: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Critical", baseBounty: 200 }
};

export default function ResponderTicketModal({ ticket, onClose, officialId, onClaimed }: { ticket: any, onClose: () => void, officialId: string, onClaimed: () => void }) {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState("");

  if (!ticket) return null;

  const sev = severityConfig[ticket.severity as keyof typeof severityConfig] || severityConfig.low;
  const totalBounty = sev.baseBounty + (ticket.bounty_amount || 0);

  const handleClaim = async () => {
    setClaiming(true);
    setError("");

    const result = await claimTicket(ticket.id);

    if (!result.success) {
      setError(result.error || "Failed to claim ticket.");
      setClaiming(false);
      return;
    }

    onClaimed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${sev.color} ${sev.bg} ${sev.border}`}>
              {sev.label} Priority
            </span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-md flex items-center gap-1">
              Bounty: {totalBounty} HC
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{ticket.category}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{ticket.reported_area || "Location missing"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>Reported {formatDistanceToNow(new Date(ticket.created_at))} ago</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldAlert size={14} />
                <span>Upvotes: {ticket.upvote_count}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-xl text-slate-300 leading-relaxed">
            {ticket.description}
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ImageIcon size={14} /> Evidence Photo
            </h3>
            {ticket.before_image_url ? (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-black/50 aspect-video relative flex items-center justify-center">
                <img 
                  src={ticket.before_image_url} 
                  alt="Issue" 
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/94a3b8?text=Image+Not+Found';
                  }}
                />
              </div>
            ) : (
              <div className="h-32 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-500 bg-slate-800/30">
                No image provided
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="text-sm text-red-400 font-medium">
            {error}
          </div>
          <div className="flex gap-3 ml-auto">
            <button 
              onClick={onClose}
              disabled={claiming}
              className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleClaim}
              disabled={claiming}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/50 transition disabled:opacity-50"
            >
              {claiming ? <Loader2 className="animate-spin" size={18} /> : "Accept Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
