'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const severityColor = (sev: number) => {
  if (sev >= 4) return 'bg-red-500/10 text-red-500 border-red-500/20';
  if (sev === 3) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  return 'bg-green-500/10 text-green-500 border-green-500/20';
};

export default function TicketList({ tickets, onSelectTicket }: { tickets: any[], onSelectTicket: (t: any) => void }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <p>No open tickets found.</p>
        <p className="text-xs mt-2">All civic issues are resolved!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-1 h-full overflow-y-auto">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id} 
          className="p-4 cursor-pointer hover:bg-slate-800/50 transition-all border-slate-800 bg-slate-900/40 backdrop-blur-md group"
          onClick={() => onSelectTicket(ticket)}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
              {ticket.category}
            </div>
            <Badge variant="outline" className={severityColor(ticket.severity)}>
              Severity {ticket.severity}
            </Badge>
          </div>
          
          <p className="text-sm text-slate-400 line-clamp-2 mb-3">
            {ticket.description}
          </p>
          
          <div className="flex justify-between items-center text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="font-medium text-slate-300">{ticket.report_count}</span> 
              {ticket.report_count === 1 ? 'report' : 'reports'}
            </div>
            <div>
              {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
