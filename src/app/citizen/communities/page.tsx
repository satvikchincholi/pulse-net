// src/app/citizen/communities/page.tsx
"use server";

import Link from "next/link";
import { fetchCommunities } from "@/app/actions/communityActions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateCommunityDialog } from "@/app/citizen/communities/CreateCommunityDialog";
import { JoinCommunityButton } from "@/app/citizen/communities/JoinCommunityButton";

/** Community Explorer – shows all communities (filtered by user's area if desired) */
export default async function CommunityExplorer() {
  const communities = await fetchCommunities(); // returns array of community objects with member count via join

  return (
    <section className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 min-h-screen transition-colors duration-300">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl md:text-5xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight">
          Community Hub
        </h1>
        {/* Placeholder for a "Create Community" button – could open a modal later */}
        <CreateCommunityDialog />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map((c) => (
          <Link key={c.id} href={`/citizen/communities/${c.name}`}>
            <Card className="h-full rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl hover:bg-white/80 dark:hover:bg-white/10 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/30 transition-all duration-300 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col">
              <CardHeader className="pb-4 border-b border-slate-200/50 dark:border-white/5 px-6 pt-6">
                <CardTitle className="text-2xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight">
                  r/{c.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed line-clamp-3 mb-4">
                  {c.description ?? "No description provided"}
                </p>
                <div className="space-y-2 mt-auto">
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20 w-fit">
                    Area: {c.area ?? "General"}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/40">
                    Members: {c.members?.length ?? 0}
                  </p>
                </div>
              </CardContent>
              <div className="px-6 pb-6">
                <JoinCommunityButton communityId={c.id} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
