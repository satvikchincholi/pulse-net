// src/app/citizen/communities/InitiativeCard.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { pledgeToInitiative } from "@/app/actions/initiativeActions";

interface InitiativeCardProps {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: "Funding" | "Active" | "Completed";
}

export function InitiativeCard({
  id,
  title,
  description,
  target_amount,
  current_amount,
  status,
}: InitiativeCardProps) {
  const [pledgeAmt, setPledgeAmt] = useState(10);
  const [loading, setLoading] = useState(false);
  const progress = Math.min(100, Math.round((current_amount / target_amount) * 100));

  const handlePledge = async () => {
    setLoading(true);
    try {
      await pledgeToInitiative(id, pledgeAmt);
    } finally {
      setLoading(false);
    }
  };

  const canPledge = status === "Funding" && pledgeAmt > 0;

  return (
    <Card className="shadow-md hover:shadow-xl transition-shadow bg-white dark:bg-slate-900">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          {title}
          {status !== "Funding" && (
            <span className="text-xs px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200">
              {status}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 space-y-3">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{description}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{progress}%</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            <strong>{current_amount}</strong> / <strong>{target_amount}</strong> HC
          </span>
          <span>{target_amount - current_amount} HC needed</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2">
        {status === "Funding" ? (
          <>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={pledgeAmt}
                onChange={e => setPledgeAmt(Number(e.target.value))}
                className="w-20 p-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
              <Button
                variant="default"
                size="sm"
                onClick={handlePledge}
                disabled={!canPledge || loading}
                className="flex items-center gap-1"
                title="Pledge Help Coins"
              >
                <Coins size={16} />
                Pledge
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your pledge will be deducted from your wallet instantly.
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This initiative is <strong>{status.toLowerCase()}</strong>.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
