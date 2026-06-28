// src/app/api/tickets/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { z } from 'zod';

// Schema validation for PATCH payload
const PatchSchema = z.object({
  status: z.enum(['open', 'claimed', 'resolved']),
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  const { data, error } = await supabaseAdmin
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const { id } = params;
  const body = await request.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { status } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from('tickets')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If the ticket is resolved, credit the author with Help Coins
  if (status === 'resolved' && data.author_id) {
    const reward = 10; // integer for transaction amount

    // Get current balance
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('help_coin_balance')
      .eq('id', data.author_id)
      .single();
    
    if (user) {
      const currentBalance = user.help_coin_balance || 0;

      // Update balance
      await supabaseAdmin
        .from('users')
        .update({ help_coin_balance: currentBalance + reward })
        .eq('id', data.author_id);

      // Insert transaction record matching public.transactions schema
      await supabaseAdmin.from('transactions').insert({
        sender_id: data.author_id,
        amount: reward,
        ticket_id: id,
        type: 'bounty_payout'
      });
    }
  }

  return NextResponse.json(data);
}
