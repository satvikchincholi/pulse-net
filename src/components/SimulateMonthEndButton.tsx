"use client";

import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SimulateMonthEndButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSimulate = async () => {
    if (!confirm("Are you sure you want to simulate the month-end payout? This will reset all current month stats and distribute bonuses!")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/cron/month-end", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        alert(`Month end simulation complete! Processed ${data.processedOfficials} officials across ${data.processedWards} wards.`);
        router.refresh();
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Network error");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleSimulate}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg transition disabled:opacity-50"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
      {loading ? "Processing..." : "Simulate Month End"}
    </button>
  );
}
