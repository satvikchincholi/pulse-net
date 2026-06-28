"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createCommunityPost } from "@/app/actions/communityActions";
import { supabase } from "@/lib/supabaseClient";

export function CreatePostForm({ communityId }: { communityId: string }) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setLoading(true);
    setError("");

    let imageUrl = "";
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('community_images')
        .upload(fileName, imageFile);

      if (uploadError) {
        setError("Failed to upload image");
        setLoading(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('community_images')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

    const res = await createCommunityPost(communityId, content, imageUrl, isAnonymous);
    if (!res.success) {
      setError(res.error || "Failed to post");
    } else {
      setContent("");
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3 p-4 border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <h3 className="font-semibold text-slate-800 dark:text-slate-200">Post an Update</h3>
      <textarea
        className="w-full p-3 border rounded-md resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={3}
        placeholder="What's happening in the community?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />
      <div className="flex items-center space-x-3">
        <label className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <span>{imageFile ? imageFile.name : "Add Photo"}</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            disabled={loading}
          />
        </label>
        {imageFile && (
          <button 
            type="button" 
            onClick={() => { setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            className="text-red-500 text-xs hover:underline"
            disabled={loading}
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || (!content.trim() && !imageFile)}>
          {loading ? "Posting..." : "Post Update"}
        </Button>
      </div>
    </form>
  );
}
