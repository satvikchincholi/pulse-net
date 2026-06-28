// src/components/CitizenRegisterForm.tsx
"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OTPVerification from '@/components/OTPVerification';

export default function CitizenRegisterForm() {
  const router = useRouter();

  // Step control (1 = basics, 2 = phone+OTP, 3 = area)
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 fields
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Step 3 field
  const [area, setArea] = useState('');

  // ---------------------------------------------------------------
  // Helper – final creation of auth user + profile row
  // ---------------------------------------------------------------
  const finalizeRegistration = async () => {
    // 1️⃣ Create Supabase Auth user (email/password+phone)
    const { data: authUser, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      phone,
    });
    if (authErr) {
      alert(authErr.message);
      return;
    }

    // 2️⃣ Insert citizen profile into public.users
    const { error: profileErr } = await supabase
      .from('users')
      .insert({
        id: authUser.user?.id,
        username,
        email,
        phone_number: phone,
        area,
      });
    if (profileErr) {
      alert(profileErr.message);
      return;
    }

    // 3️⃣ Redirect to citizen dashboard
    router.push('/citizen/dashboard');
  };

  // ---------------------------------------------------------------
  // Render steps
  // ---------------------------------------------------------------
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-bold">Citizen Registration – Step 1</h2>
        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button onClick={() => setStep(2)} disabled={!username || !email || !password}>Continue → OTP</Button>
      </div>
    );
  }

  if (step === 2) {
    const sendOTP = async () => {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        alert(error.message);
        return;
      }
      setOtpSent(true);
    };

    return (
      <div className="max-w-md mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-bold">Citizen Registration – Step 2 (Phone OTP)</h2>
        <Input placeholder="Phone (+1 555‑123‑4567)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button onClick={sendOTP} disabled={!phone || otpSent}>Send OTP</Button>
        {otpSent && (
          <OTPVerification
            phone={phone}
            onVerified={() => setStep(3)}
            onFailed={(msg: string) => alert(msg)}
          />
        )}
        <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
      </div>
    );
  }

  // step === 3 – area selection & final submission
  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Citizen Registration – Step 3 (Area)</h2>
      <Input placeholder="Your local area / ward (e.g. 'Ward 42, Jagat Circle')" value={area} onChange={(e) => setArea(e.target.value)} />
      <Button onClick={finalizeRegistration} disabled={!area}>Finish & Go to Dashboard</Button>
      <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
    </div>
  );
}
