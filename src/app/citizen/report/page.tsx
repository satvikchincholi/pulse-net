"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createTicket } from "@/app/actions/citizenActions";
import { Loader2, Image as ImageIcon, MapPin, AlertTriangle, UploadCloud } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

export default function CitizenReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [category, setCategory] = useState("Pothole");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low"|"medium"|"high"|"critical">("medium");
  const [reportedArea, setReportedArea] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isAnonymous, setIsAnonymous] = useState(false);
  // Start as null, wait for geolocation, fallback to NYC if failed
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          console.log("Geolocation error:", err);
          setPosition([40.7128, -74.0060]); // NYC fallback
        },
        { timeout: 5000 }
      );
    } else {
      setPosition([40.7128, -74.0060]); // NYC fallback
    }
  }, []);

  // Reverse Geocoding to auto-fill the reported area
  useEffect(() => {
    if (!position) return;
    const fetchAddress = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) return;
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${position[0]},${position[1]}&key=${apiKey}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setReportedArea(data.results[0].formatted_address);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    };
    
    // Only fetch if it's not the exact default NYC coords (to avoid wasting API calls)
    if (position[0] !== 40.7128 || position[1] !== -74.0060) {
      fetchAddress();
    }
  }, [position]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let uploadedUrl = "";
    
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
      
      const { data, error: uploadErr } = await supabase.storage
        .from("reports")
        .upload(`public/${fileName}`, imageFile);

      if (uploadErr) {
        setError("Failed to upload image: " + uploadErr.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("reports")
        .getPublicUrl(`public/${fileName}`);
        
      uploadedUrl = publicUrlData.publicUrl;
    }

    if (!position) {
      setError("Please wait for your location to be detected.");
      setLoading(false);
      return;
    }

    const res = await createTicket({
      category,
      description,
      severity,
      reported_area: reportedArea,
      before_image_url: uploadedUrl,
      lat: position[0],
      lng: position[1],
      is_anonymous: isAnonymous
    });

    if (res.success) {
      router.push("/citizen/feed");
    } else {
      setError(res.error || "Failed to submit report");
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-2xl mx-auto w-full transition-colors duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Report an Issue</h1>
        <p className="text-sm md:text-base font-medium text-slate-500 dark:text-white/50">Help improve your neighborhood by logging infrastructure issues.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]">
        
        {/* Category & Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">Issue Type</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-slate-100/50 dark:bg-black/20 border border-slate-300/50 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none outline-none transition"
            >
              <option value="Pothole" className="text-black">Pothole</option>
              <option value="Streetlight Outage" className="text-black">Streetlight Outage</option>
              <option value="Graffiti" className="text-black">Graffiti</option>
              <option value="Water Leak" className="text-black">Water Leak</option>
              <option value="Fallen Tree" className="text-black">Fallen Tree</option>
              <option value="Other" className="text-black">Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">Severity</label>
            <select 
              value={severity} 
              onChange={e => setSeverity(e.target.value as any)}
              className="w-full bg-slate-100/50 dark:bg-black/20 border border-slate-300/50 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none outline-none transition"
            >
              <option value="low" className="text-black">Low</option>
              <option value="medium" className="text-black">Medium</option>
              <option value="high" className="text-black">High</option>
              <option value="critical" className="text-black">Critical</option>
            </select>
          </div>
        </div>

        {/* Location Picker */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin size={14} /> Exact Location
          </label>
          <div className="rounded-2xl overflow-hidden border border-slate-300/50 dark:border-white/10">
            <LocationPicker position={position} setPosition={setPosition} />
          </div>
          
          <input 
            type="text" 
            value={reportedArea}
            onChange={e => setReportedArea(e.target.value)}
            required
            placeholder="Auto-detecting address..."
            className="w-full bg-slate-100/50 dark:bg-black/20 border border-slate-300/50 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none outline-none mt-2 transition"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest flex items-center gap-1.5">
            <ImageIcon size={14} /> Photo Evidence
          </label>
          <div className="relative border border-dashed border-slate-300 dark:border-white/20 rounded-2xl bg-slate-100/50 dark:bg-black/20 p-6 text-center hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition cursor-pointer group">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {imagePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-xl border border-slate-200/50 dark:border-white/10 shadow-lg" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-white/50 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">Tap to change image</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-white/50 py-6">
                <UploadCloud size={32} className="text-cyan-600 dark:text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Click to upload or drag & drop</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">JPG, PNG, GIF up to 5MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={14} /> Issue Description & Exact Instructions
          </label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={3}
            placeholder="Describe the issue and provide exact instructions for the municipal worker to find it..."
            className="w-full bg-slate-100/50 dark:bg-black/20 border border-slate-300/50 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:border-cyan-500/50 focus:bg-white/80 dark:focus:bg-white/5 shadow-inner dark:shadow-none outline-none resize-none transition"
          />
        </div>

        {error && <div className="text-[10px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400 p-3 bg-red-500/10 rounded-2xl border border-red-500/20">{error}</div>}

        {/* Ghost Mode toggle */}
        <div className="flex items-center space-x-2 mb-4">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-200/50 dark:bg-black/40 border-slate-300/50 dark:border-white/20 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 dark:focus:ring-offset-black transition"
            />
            Post Anonymously (Ghost Mode)
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || !imageFile || !reportedArea || !description || !position}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-4 py-4 text-sm font-bold text-white dark:text-black transition hover:bg-slate-800 dark:hover:bg-white/90 disabled:opacity-50 shadow-lg dark:shadow-none"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
