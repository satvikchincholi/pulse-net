import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OTPVerificationProps {
  phone: string;
  onVerified: () => void;
  onFailed: (msg: string) => void;
}

export default function OTPVerification({ phone, onVerified, onFailed }: OTPVerificationProps) {
  const [token, setToken] = useState('');
  const [verifying, setVerifying] = useState(false);

  const verifyOTP = async () => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });
      if (error) {
        onFailed(error.message);
      } else if (data.session || data.user) {
        onVerified();
      } else {
        onFailed('Verification failed. Please try again.');
      }
    } catch (err: any) {
      onFailed(err.message || 'An error occurred during verification.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-2 mt-4 p-4 border border-slate-800 rounded-xl bg-slate-950">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enter OTP Code</label>
      <Input
        placeholder="6-digit code"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        disabled={verifying}
      />
      <Button onClick={verifyOTP} disabled={!token || verifying} className="w-full">
        {verifying ? 'Verifying...' : 'Verify OTP'}
      </Button>
    </div>
  );
}
