"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createPostComment, deleteCommunityPost, togglePostAnonymity } from "@/app/actions/communityActions";
import { supabase } from "@/lib/supabaseClient";

export function CommunityFeed({ posts, isMember, currentUserEmail }: { posts: any[]; isMember: boolean; currentUserEmail: string | null }) {
  if (posts.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No updates have been posted yet.</p>;
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} isMember={isMember} currentUserEmail={currentUserEmail} />
      ))}
    </div>
  );
}

function PostItem({ post, isMember, currentUserEmail }: { post: any; isMember: boolean; currentUserEmail: string | null }) {
  const [commentContent, setCommentContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setLoading(true);
    const res = await createPostComment(post.id, commentContent);
    if (res.success) {
      setCommentContent("");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const res = await deleteCommunityPost(post.id);
    if (!res.success) {
      alert(res.error ?? "Failed to delete post");
    }
  };

  const toggleAnonymity = async (status: boolean) => {
    const res = await togglePostAnonymity(post.id, status);
    if (!res.success) alert(res.error);
    setMenuOpen(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm relative">
        <div className="flex items-center space-x-3 mb-3">
          {/* Author avatar */}
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
            {(post.author_email?.charAt(0) || "?").toUpperCase()}
          </div>
          {/* Author info */}
          <div>
            {post.is_anonymous ? (
              <p className="font-medium text-slate-900 dark:text-slate-100">Anonymous</p>
            ) : (
              <p className="font-medium text-slate-900 dark:text-slate-100">{post.author_email?.split("@")[0] || "Unknown"}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(post.created_at).toLocaleString()}</p>
          </div>
        </div>
        {/* Three‑dot menu — always visible */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400"
            aria-label="Post options"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <div className="mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg absolute right-0 z-20 animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-300 ease-out origin-top-right">
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => {
                      setDeleteDialogOpen(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >Delete post</button>
                </li>
                <li>
                  {post.is_anonymous ? (
                    <button
                      onClick={() => toggleAnonymity(false)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >Remove anonymity</button>
                  ) : (
                    <button
                      onClick={() => toggleAnonymity(true)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >Make anonymous</button>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this post? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => {
                handleDelete();
                setDeleteDialogOpen(false);
              }}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{post.content}</p>
      
      {post.image_url && (
        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <img src={post.image_url} alt="Post attachment" className="w-full h-auto object-cover max-h-96" />
        </div>
      )}

      {/* Comments Toggle */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {post.comments?.length === 1 ? "1 Comment" : `${post.comments?.length || 0} Comments`}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
          {post.comments?.map((comment: any) => (
            <div key={comment.id} className="text-sm">
              <span className="font-medium text-slate-800 dark:text-slate-200 mr-2">
                {comment.author_email?.split("@")[0] || "Unknown"}:
              </span>
              <span className="text-slate-600 dark:text-slate-400">{comment.content}</span>
            </div>
          ))}
          
          {isMember ? (
            <form onSubmit={handleComment} className="flex space-x-2 mt-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                disabled={loading}
                className="flex-1 px-3 py-2 text-sm border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button type="submit" size="sm" disabled={loading || !commentContent.trim()}>
                Post
              </Button>
            </form>
          ) : (
            <p className="text-xs text-slate-500 mt-2">Join the community to comment.</p>
          )}
        </div>
      )}
    </div>
  );
}
