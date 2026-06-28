// src/app/citizen/communities/CreateCommunityDialog.tsx
"use client";

import { useState, FormEvent } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createCommunity } from "@/app/actions/communityActions";

export function CreateCommunityDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: String(formData.get("name")),
      description: String(formData.get("description")),
      area: String(formData.get("area")),
    };
    const result = await createCommunity(data);
    if (result.success) {
      setOpen(false);
    } else {
      setError(result.error || "Failed to create community");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-black shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-slate-800 dark:hover:bg-white/90 transition w-full md:w-auto shrink-0" />}>
        Create Community
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/80 dark:bg-black/60 backdrop-blur-3xl border border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white rounded-[2.5rem] shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-manrope font-extrabold tracking-tight">New Node</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-white/50 text-sm font-medium">Create a new community node. Enter a unique slug name.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <input name="name" placeholder="Community slug (e.g., ward42green)" required className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm font-medium" />
          </div>
          <div>
            <textarea name="description" placeholder="Description (optional)" rows={3} className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm font-medium resize-none" />
          </div>
          <div>
            <input name="area" placeholder="Area (optional)" className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm font-medium" />
          </div>
          {error && <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-red-500 dark:text-red-400">{error}</p>}
          <DialogFooter className="mt-6">
            <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30 border border-cyan-500/20 dark:border-cyan-500/30 font-mono font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 transition-all disabled:opacity-50 shadow-lg dark:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
              {loading ? "Initializing…" : "Initialize Node"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
