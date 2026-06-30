"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Camera, 
  Ghost, 
  Clock, 
  Users, 
  Map, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  ArrowRight, 
  Focus 
} from 'lucide-react';
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white relative overflow-hidden font-sans selection:bg-cyan-500/30 transition-colors duration-500">
      
      {/* Background Watermorphism Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-300/30 dark:bg-cyan-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[100px] dark:blur-[120px] animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-blue-300/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[100px] dark:blur-[120px] animate-[float_12s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen blur-[100px] dark:blur-[120px] animate-[float_15s_ease-in-out_infinite]" />
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          10%, 90% { opacity: 1; }
          50% { top: 90%; }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg) scale(1.1); }
          50% { transform: rotate(5deg) scale(1.15); }
        }
      `}} />
      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="text-2xl font-manrope font-extrabold tracking-tight flex items-center gap-2">
            <Activity className="text-cyan-400" />
            PulseNet
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login" className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors">
              Citizen Login
            </Link>
            <Link href="/auth/responder/login" className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:bg-slate-800 dark:hover:bg-white/90 transition-colors shadow-lg dark:shadow-none">
              Responder Portal
            </Link>
          </nav>
        </header>
        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[240px] gap-6">
          
          {/* 1. THE HERO/WALLET CARD (col-2, row-2) */}
          <div className="group md:col-span-2 md:row-span-2 rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.05)] p-10 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono font-bold uppercase tracking-widest text-[10px] mb-8">
                <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
                Citizen Node Active
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-manrope font-extrabold tracking-tight mb-4 leading-none text-slate-900 dark:text-white">
                PulseNet
              </h1>
              <p className="text-slate-500 dark:text-white/50 text-lg font-medium max-w-sm leading-relaxed">
                The decentralized civic layer. Fix your city. Earn merit.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
              <div>
                <div className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-400 dark:text-white/50 mb-1">Help Coin Balance</div>
                <div className="text-4xl font-mono font-light tracking-tighter text-slate-900 dark:text-white flex items-baseline gap-2">
                  12,450 <span className="text-lg font-bold text-cyan-500 dark:text-cyan-400 font-mono">HC</span>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Link href="/auth/register" className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:bg-slate-800 dark:hover:bg-white/90 transition-colors shadow-lg dark:shadow-none flex items-center justify-center gap-2">
                  Join the Network
                </Link>
                <Link href="/auth/login" className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-white font-bold text-sm hover:bg-white/80 dark:hover:bg-white/20 transition-colors shadow-sm dark:shadow-none flex items-center justify-center">
                  Citizen Login
                </Link>
              </div>
            </div>
          </div>
          {/* 2. AI AUDITOR CARD (col-1, row-2) */}
          <div className="group md:col-span-1 md:row-span-2 rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.05)] p-8 flex flex-col transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/30 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-slate-900/5 dark:bg-white/10 flex items-center justify-center">
                <Focus className="text-cyan-600 dark:text-cyan-400" size={20} />
              </div>
              <h3 className="font-manrope font-extrabold tracking-tight text-sm text-slate-900 dark:text-white">Gemini Auditor</h3>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
              {/* Scanner Visual */}
              <div className="relative w-full aspect-square max-w-[160px] mx-auto rounded-3xl bg-slate-200/50 dark:bg-black/40 border border-slate-300/50 dark:border-white/10 overflow-hidden mb-6 flex items-center justify-center">
                <Camera size={32} className="text-slate-400 dark:text-white/20" />
                {/* Laser Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
              </div>
              
              
              <div className="text-center w-full mt-auto">
                <div className="text-3xl font-mono font-light tracking-tighter mb-1 text-slate-900 dark:text-white">98.8%</div>
                <div className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-400 dark:text-white/50 mb-4">Authenticity</div>
                
                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-cyan-500 dark:bg-cyan-400 w-[98.8%]" />
                </div>
                
                <div className="flex justify-between items-center font-mono font-bold uppercase tracking-widest text-[10px]">
                  <span className="text-slate-600 dark:text-white/70">Deepfake Prob: 1.2%</span>
                  <span className="text-cyan-600 dark:text-cyan-400">5-Strike Active</span>
                </div>
              </div>
            </div>
          </div>
 
          {/* 3. GIG MODE CARD (col-1, row-1) */}
          <div className="group md:col-span-1 md:row-span-1 rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.05)] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Ghost size={24} />
              </div>
              <h3 className="font-manrope font-extrabold tracking-tight text-sm text-slate-900 dark:text-white">Ghost Mode</h3>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-white/50 leading-relaxed mt-4">
              Verified identity masked on public feeds. Rewards securely routed.
            </p>
          </div>
 
          {/* 4. ESCALATION MATRIX CARD (col-1, row-1) */}
          <div className="group md:col-span-1 md:row-span-1 rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.05)] p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/20 dark:bg-red-500/20 blur-[50px] rounded-full pointer-events-none group-hover:bg-amber-400/20 dark:group-hover:bg-amber-500/30 transition-colors duration-500" />
            
            <h3 className="font-manrope font-extrabold tracking-tight text-sm mb-4 relative z-10 text-slate-900 dark:text-white">4-Day Smart Contract</h3>
            
            <div className="relative border-l border-slate-300 dark:border-white/10 pl-4 space-y-3 flex-1 flex flex-col justify-center z-10">
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-white/30" />
                <div className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50">0h: Marketplace</div>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                <div className="font-mono font-bold uppercase tracking-widest text-[10px] text-amber-600 dark:text-amber-400">24h: Official Routing</div>
              </div>
              <div className="relative">
                <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] dark:shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                <div className="font-mono font-bold uppercase tracking-widest text-[10px] text-red-700 dark:text-red-400">96h: RPA Injection</div>
              </div>
            </div>
          </div>
 
          {/* 5. COMMUNITY CROWDFUND CARD (col-2, row-1) */}
          <div className="group md:col-span-2 md:row-span-1 rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.05)] p-8 flex items-center justify-between transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/30">
            <div className="flex items-center gap-6">
              {/* Liquid Progress */}
              <div className="relative w-24 h-24 rounded-full border-4 border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-black/20 shadow-inner">
                <div className="absolute bottom-[-10%] left-0 right-0 bg-cyan-400 dark:bg-cyan-500/80 w-full h-[92%] animate-[wave_4s_ease-in-out_infinite]" style={{ borderRadius: '40% 40% 0 0' }} />
                <span className="relative z-10 text-xl font-mono font-bold text-cyan-950 dark:text-cyan-950 drop-shadow-sm">82%</span>
              </div>
              
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-500 dark:text-white/60 font-mono font-bold uppercase tracking-widest text-[10px] mb-3 shadow-sm dark:shadow-none">
                  <Users size={12} /> r/Ward42Green
                </div>
                <h3 className="font-manrope font-extrabold tracking-tight text-xl mb-1 text-slate-900 dark:text-white">Jagat Circle Park Cleanup</h3>
                <div className="font-mono font-bold uppercase tracking-widest text-[10px] text-slate-500 dark:text-white/50">Target: 5,000 HC</div>
              </div>
            </div>
            
            <button className="w-12 h-12 rounded-full bg-slate-200/50 dark:bg-white/10 flex items-center justify-center hover:bg-slate-300/50 dark:hover:bg-white/20 transition-colors text-slate-700 dark:text-white">
              <ArrowRight size={20} />
            </button>
          </div>
          {/* 6. RESPONDER GIG MAP (col-2, row-1) */}
          <div className="group md:col-span-2 md:row-span-1 rounded-[2.5rem] bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 shadow-xl dark:shadow-[inset_0_0_80px_rgba(255,255,255,0.05)] p-8 flex items-center justify-between transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 dark:hover:border-white/30 relative overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-20 pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
            
            <div className="relative z-10 max-w-[200px]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold uppercase tracking-widest text-[10px] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Meritocracy network live
              </div>
              <h3 className="font-manrope font-extrabold tracking-tight text-2xl mb-2 text-slate-900 dark:text-white">Active Responder Grid</h3>
            </div>
            {/* Pins */}
            <div className="relative z-10 w-48 h-full">
              <div className="absolute top-2 right-12 bg-slate-900 dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-xl font-mono font-bold uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-1 group-hover:-translate-y-2 transition-transform duration-500">
                <Map size={12} /> 800 HC
              </div>
              <div className="absolute bottom-4 right-2 bg-cyan-500 text-white dark:text-black px-3 py-1.5 rounded-xl font-mono font-bold uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-1 group-hover:-translate-y-2 transition-transform duration-500 delay-75">
                <Map size={12} /> 1500 HC
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
