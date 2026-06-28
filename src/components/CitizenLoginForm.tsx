// src/components/CitizenLoginForm.tsx
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CitizenLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      // Redirect to citizen dashboard after successful login
      router.push('/citizen/dashboard');
    }
  };

  return (
    <div className="max-w-md w-full space-y-4 p-6 bg-slate-800/50 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-center text-white">Citizen Login</h2>
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleLogin} disabled={!email || !password} className="w-full">
        Sign In
      </Button>
    </div>
  );
}
