// src/app/actions/communityActions.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

/**
 * Create a new community.
 * The slug (name) must be unique.
 */
export async function createCommunity(data: {
  name: string; // unique slug, e.g. "ward42green"
  description?: string;
  area?: string;
}): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get authenticated user
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  const trimmedName = data.name.trim();
  const { error, data: insertedCommunity } = await supabase.from("communities").insert({
    name: trimmedName,
    description: data.description ?? null,
    area: data.area ?? null,
    created_by: user.id,
  }).select().single();

  if (error) return { success: false, error: error.message };
  // Add creator as admin member automatically
  await supabase.from("community_members").insert({
    community_id: insertedCommunity.id,
    user_id: user.id,
    role: "admin",
  });

  revalidatePath("/citizen/communities");
  return { success: true };
}

/** Join an existing community as a regular member */
export async function joinCommunity(communityId: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  // Prevent duplicate membership
  const { data: existing } = await supabase
    .from("community_members")
    .select("*", { count: "exact" })
    .eq("community_id", communityId)
    .eq("user_id", user.id);

  if (existing && existing.length > 0) {
    return { success: false, error: "Already a member of this community" };
  }

  const { error } = await supabase.from("community_members").insert({
    community_id: communityId,
    user_id: user.id,
    role: "member",
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/citizen/communities");
  return { success: true };
}

/** Fetch all communities (optionally filter by area) */
export async function fetchCommunities(area?: string): Promise<any[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const query = supabase.from("communities").select("*, members:community_members(user_id)");
  const q = area ? query.eq("area", area) : query;
  const { data, error } = await q;
  if (error) return [];
  return data;
}

/** Fetch a single community by slug */
export async function fetchCommunityBySlug(slug: string): Promise<any | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const cleanSlug = slug.trim();
  const { data, error } = await supabase
    .from("communities")
    .select("*, members:community_members(user_id, role)")
    .ilike("name", cleanSlug)
    .single();
  if (error) return null;
  return data;
}

/** Fetch members of a community */
export async function fetchCommunityMembers(communityId: string): Promise<any[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("community_members")
    .select("user_id, role, user:auth.users!inner(email, username)")
    .eq("community_id", communityId);
  if (error) return [];
  return data;
}

/** Fetch initiatives belonging to a community */
export async function fetchCommunityInitiatives(communityId: string): Promise<any[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("initiatives")
    .select("*", { count: "exact" })
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

/** Update member role (e.g., promote to admin) */
export async function updateMemberRole(communityId: string, userId: string, newRole: "admin" | "member"): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  // Check if current user is admin
  const { data: currentMember } = await supabase
    .from("community_members")
    .select("role")
    .eq("community_id", communityId)
    .eq("user_id", user.id)
    .single();

  if (currentMember?.role !== "admin") {
    return { success: false, error: "Only admins can change roles" };
  }

  const { error } = await supabase
    .from("community_members")
    .update({ role: newRole })
    .eq("community_id", communityId)
    .eq("user_id", userId);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/citizen/communities/[slug]`, "page");
  return { success: true };
}

/** Create a new community post */
export async function createCommunityPost(communityId: string, content: string, imageUrl?: string, isAnonymous: boolean = false): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  const { error } = await supabase.from("community_posts").insert({
    community_id: communityId,
    author_id: user.id,
    author_email: user.email,
    content,
    image_url: imageUrl || null,
    is_anonymous: isAnonymous,
  });

  if (error) {
    if (error.message.includes("is_anonymous")) {
      // Fallback for when the column hasn't been created in the database yet
      const { error: fallbackErr } = await supabase.from("community_posts").insert({
        community_id: communityId,
        author_id: user.id,
        author_email: user.email,
        content,
        image_url: imageUrl || null,
      });
      if (fallbackErr) {
        console.error("createCommunityPost fallback error:", fallbackErr);
        return { success: false, error: fallbackErr.message };
      }
    } else {
      console.error("createCommunityPost error:", error);
      return { success: false, error: error.message };
    }
  }
  revalidatePath(`/citizen/communities/[slug]`, "page");
  return { success: true };
}

/** Create a comment on a community post */
export async function deleteCommunityPost(postId: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  // Directly delete the post (any authenticated user can delete)
  const { error: delErr } = await supabase.from("community_posts").delete().eq("id", postId);
  if (delErr) {
    console.error("deleteCommunityPost error:", delErr);
    return { success: false, error: delErr.message };
  }
  revalidatePath(`/citizen/communities/[slug]`, "page");
  return { success: true };
}

/** Create a comment on a community post */
export async function createPostComment(postId: string, content: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  const { error } = await supabase.from("community_comments").insert({
    post_id: postId,
    author_id: user.id,
    author_email: user.email,
    content,
  });

  if (error) {
    console.error("createPostComment error:", error);
    return { success: false, error: error.message };
  }
  revalidatePath(`/citizen/communities/[slug]`, "page");
  return { success: true };
}

/** Fetch posts and their comments for a community */
export async function fetchCommunityPosts(communityId: string): Promise<any[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("community_posts")
    .select(`
      id, content, created_at, image_url, author_id, author_email, is_anonymous,
      comments:community_comments(
        id, content, created_at, author_id, author_email
      )
    `)
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) {
    // Only log the error if it's something unexpected (not the missing column we are handling)
    if (!error.message?.includes('is_anonymous')) {
      console.error("fetchCommunityPosts error:", error);
    }
    
    // Fallback: fetch without the is_anonymous column
    const { data: data2, error: error2 } = await supabase
      .from("community_posts")
      .select(`
        id, content, created_at, image_url, author_id, author_email,
        comments:community_comments(
          id, content, created_at, author_id, author_email
        )
      `)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });
      
    if (error2) {
      console.error("fetchCommunityPosts fallback error:", error2);
      return [];
    }
    return data2.map(post => ({
      ...post,
      comments: post.comments?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || []
    }));
  }
  // Sort comments older first

  return data.map(post => ({
    ...post,
    comments: post.comments?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || []
  }));
}

/** Toggle anonymity for a post */
export async function togglePostAnonymity(postId: string, makeAnonymous: boolean): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  // Verify author
  const { data: post, error: fetchErr } = await supabase
    .from("community_posts")
    .select("author_id")
    .eq("id", postId)
    .single();
  if (fetchErr) {
    console.error("togglePostAnonymity fetch error:", fetchErr);
    return { success: false, error: fetchErr.message };
  }
  if (post.author_id !== user.id) {
    return { success: false, error: "Not authorized to change anonymity" };
  }

  const { error: updErr } = await supabase
    .from("community_posts")
    .update({ is_anonymous: makeAnonymous })
    .eq("id", postId);
  if (updErr) {
    if (updErr.message.includes("is_anonymous")) {
      return { success: false, error: "Database needs updating! Please run the SQL command I provided in your Supabase Dashboard." };
    }
    console.error("togglePostAnonymity update error:", updErr);
    return { success: false, error: updErr.message };
  }
  revalidatePath(`/citizen/communities/[slug]`, "page");
  return { success: true };
}
