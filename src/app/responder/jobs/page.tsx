"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { submitResolution } from "@/app/actions/payoutActions";
import { Loader2, UploadCloud, MapPin, CheckCircle, ShieldAlert } from "lucide-react";

export default function ActiveJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution state
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  const fetchJobs = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .eq("solver_id", user.id)
      .eq("status", "claimed")
      .order("created_at", { ascending: false });
    
    if (data) setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !imageFile) return;
    
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("ticketId", selectedJob);
    formData.append("image", imageFile);

    let res;
    if (typeof window !== "undefined" && (window as any).__MOCK_RESOLVE_FRAUD__) {
      res = { success: false, error: "AI Verification Failed: Fraud detected" };
    } else {
      res = await submitResolution(formData);
    }
    
    if (res.success) {
      setMessage({ text: `Success! You earned ${res.payout} Help Coins (Tier Multiplier: ${res.tierMultiplier}x).`, type: 'success' });
      // Remove from list
      setJobs(prev => prev.filter(j => j.id !== selectedJob));
      setSelectedJob(null);
      setImageFile(null);
    } else {
      setMessage({ text: res.error || "Failed to submit resolution.", type: 'error' });
    }
    
    setSubmitting(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Active Jobs</h1>
          <p className="text-slate-400 mt-1">Submit proof of work to claim your Help Coin bonuses.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-red-900/30 border-red-500/50 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center p-16 border border-slate-800 rounded-2xl bg-slate-900/50">
            <ShieldAlert size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-slate-300">No active jobs</h3>
            <p className="text-slate-500 mt-2">Check the Bounty Map to accept new tasks.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map(job => (
              <div key={job.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{job.category}</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                      <MapPin size={14} /> {job.reported_area || "Unknown Location"}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-md border border-emerald-500/20">
                    Base: {job.severity}
                  </span>
                </div>
                
                <p className="text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6">
                  {job.description}
                </p>

                {selectedJob === job.id ? (
                  <form onSubmit={handleResolve} className="bg-slate-950/50 p-5 rounded-xl border border-emerald-900/30 space-y-4">
                    <h4 className="font-medium text-emerald-400 flex items-center gap-2">
                      <UploadCloud size={18} /> Submit Proof of Resolution
                    </h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase tracking-wider">Upload After Photo</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        capture="environment"
                        required
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-300 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-900/30 file:text-emerald-400 hover:file:bg-emerald-900/50"
                      />
                      <p className="text-xs text-slate-500">Take a photo showing the resolved issue. AI will verify this.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setSelectedJob(null)}
                        className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={submitting || !imageFile}
                        className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition disabled:opacity-50"
                      >
                        {submitting ? <Loader2 size={18} className="animate-spin"/> : <><CheckCircle size={18} /> Complete & Claim Bonus</>}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setSelectedJob(job.id)}
                    className="w-full py-3 border border-emerald-600/30 bg-emerald-900/10 text-emerald-400 rounded-xl font-medium hover:bg-emerald-900/20 hover:border-emerald-500/50 transition"
                  >
                    Submit Proof of Work
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
