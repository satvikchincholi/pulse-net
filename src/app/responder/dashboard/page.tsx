"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import dynamic from "next/dynamic";
import OpenTicketList from "@/components/OpenTicketList";
import ResponderTicketModal from "@/components/ResponderTicketModal";

// Map needs to be client-side only
const ResponderMap = dynamic(() => import("@/components/ResponderMap"), { ssr: false });

export default function ResponderDashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [officialId, setOfficialId] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    setOfficialId(user.id);

    // Initial fetch
    const fetchTickets = async () => {
      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      
      if (data) setTickets(data);
    };

    fetchTickets();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.status === 'open') {
            setTickets(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status !== 'open') {
              // Remove if claimed or resolved
              setTickets(prev => prev.filter(t => t.id !== payload.new.id));
              if (selectedTicket?.id === payload.new.id) {
                setSelectedTicket(null);
              }
            } else {
              // Update existing
              setTickets(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
            }
          } else if (payload.eventType === 'DELETE') {
            setTickets(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <div className="flex h-full w-full bg-slate-950 overflow-hidden relative">
      
      {/* Map Area */}
      <div className="flex-1 h-full relative z-0">
        <ResponderMap 
          tickets={tickets} 
          onSelectTicket={setSelectedTicket} 
        />
      </div>

      {/* Sidebar List */}
      <div className="w-96 border-l border-emerald-900/30 bg-slate-900/80 backdrop-blur-md flex flex-col z-10 relative shadow-2xl">
        <div className="p-4 border-b border-emerald-900/30 bg-slate-900/90">
          <h2 className="font-semibold text-white">Open Tasks in Jurisdiction</h2>
          <div className="text-sm text-slate-400 mt-1 flex items-center justify-between">
            <span>Live Feed</span>
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {tickets.length} available
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <OpenTicketList 
            tickets={tickets} 
            onSelectTicket={setSelectedTicket}
            selectedId={selectedTicket?.id} 
          />
        </div>
      </div>

      {/* Modal Overlay */}
      {selectedTicket && (
        <ResponderTicketModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          officialId={officialId}
          onClaimed={() => {
            // Optimistically remove from list
            setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
          }}
        />
      )}
    </div>
  );
}
