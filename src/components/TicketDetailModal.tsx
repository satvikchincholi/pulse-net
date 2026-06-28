'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function TicketDetailModal({ ticket, isOpen, onClose, onResolve }: { 
  ticket: any | null; 
  isOpen: boolean; 
  onClose: () => void;
  onResolve: (id: string) => void;
}) {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <div className="flex justify-between items-center pr-6">
            <DialogTitle className="text-xl">{ticket.category} Issue</DialogTitle>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              {ticket.status}
            </Badge>
          </div>
          <DialogDescription className="text-slate-400 pt-2">
            Reported {new Date(ticket.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-64 rounded-xl overflow-hidden mt-2 bg-slate-950 border border-slate-800">
          <Image 
            src={ticket.image_url} 
            alt="Civic Issue" 
            fill 
            className="object-cover"
            unoptimized // For Supabase storage URLs or raw Telegram URLs
          />
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-1">AI Analysis</h4>
            <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              {ticket.description}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-500 uppercase font-semibold">Severity</div>
              <div className="text-lg font-bold mt-1 text-slate-200">{ticket.severity} / 5</div>
            </div>
            <div className="flex-1 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-500 uppercase font-semibold">Reports</div>
              <div className="text-lg font-bold mt-1 text-slate-200">{ticket.report_count}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 sm:justify-between">
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Close
          </Button>
          <Button 
            onClick={() => onResolve(ticket.id)}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
          >
            Mark as Resolved
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
