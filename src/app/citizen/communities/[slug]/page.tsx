// src/app/citizen/communities/[slug]/page.tsx


import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchCommunityBySlug, fetchCommunityMembers, fetchCommunityInitiatives, fetchCommunityPosts } from "@/app/actions/communityActions";
import { InitiativeCard } from "@/app/citizen/communities/InitiativeCard";
import { MemberList } from "@/app/citizen/communities/MemberList";
import { CommunityFeed } from "@/app/citizen/communities/CommunityFeed";
import { CreatePostForm } from "@/app/citizen/communities/CreatePostForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function CommunityDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const community = await fetchCommunityBySlug(slug);
  if (!community) notFound();

  const members = await fetchCommunityMembers(community.id);
  const initiatives = await fetchCommunityInitiatives(community.id);
  const posts = await fetchCommunityPosts(community.id);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const currentUserMember = members.find(m => m.user_id === user?.id);
  const isMember = !!currentUserMember;
  // The community creator is always an admin even if they have no member row (e.g. manual SQL insert)
  const isAdmin = currentUserMember?.role === "admin" || community.created_by === user?.id;


  return (
    <section className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 min-h-screen transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight">
            r/{community.name}
          </h1>
          <p className="text-slate-500 dark:text-white/50 mt-2 text-sm md:text-base font-medium">
            {community.description ?? "No description provided."}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20 w-fit mt-3">
            Area: {community.area ?? "General"}
          </p>
        </div>
        {/* Placeholder for admin‑only "Create Initiative" button */}
        <button disabled className="flex items-center justify-center gap-2 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 px-6 py-3 text-sm font-bold text-slate-400 dark:text-white/30 cursor-not-allowed transition w-full md:w-auto shrink-0">Create Initiative</button>
      </header>

      {/* Feed Section */}
      <section className="rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]">
        <h2 className="text-2xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Community Updates
        </h2>
        {isAdmin && <CreatePostForm communityId={community.id} />}
        <CommunityFeed posts={posts} isMember={isMember} currentUserEmail={user?.email ?? null} />
      </section>

      {/* Members Section */}
      <section className="rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]">
        <h2 className="text-2xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Members ({members?.length ?? 0})
        </h2>
        <MemberList communityId={community.id} isAdmin={isAdmin} />
      </section>

      {/* Initiatives Section */}
      <section className="rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]">
        <h2 className="text-2xl font-manrope font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
          Initiatives
        </h2>
        {initiatives.length === 0 ? (
          <p className="text-slate-500 dark:text-white/50 text-sm font-medium">No initiatives yet. Be the first to propose one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initiatives.map((i) => (
              <InitiativeCard
                key={i.id}
                id={i.id}
                title={i.title}
                description={i.description ?? ""}
                target_amount={Number(i.target_amount)}
                current_amount={Number(i.current_amount)}
                status={i.status as any}
              />
            ))}
          </div>
        )}
      </section>

      <Link href="/citizen/communities" className="inline-flex font-mono text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/50 hover:text-cyan-600 dark:hover:text-cyan-400 transition mt-4 px-4 py-2 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-none">
        ← Back to Community Hub
      </Link>
    </section>
  );
}
