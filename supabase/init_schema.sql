-- ==============================================================================
-- PULSENET MASTER SCHEMA - BONUS ENGINE EDITION
-- ==============================================================================

-- 0. CLEANUP (Drop old tables if they exist to avoid conflicts)
DROP TABLE IF EXISTS public.ticket_reports CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.municipal_officials CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.ticket_upvotes CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.monthly_budgets CASCADE;
DROP TABLE IF EXISTS public.leaderboard_snapshots CASCADE;

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS postgis;

DO $$ BEGIN
    CREATE TYPE severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_enum AS ENUM ('open', 'claimed', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('bounty_payout', 'user_tip', 'leaderboard_bonus', 'tier_bonus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tier_enum AS ENUM ('bronze', 'silver', 'gold', 'diamond');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- TABLE 1: USERS (Citizens)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT NOT NULL UNIQUE,
    ward_area TEXT,
    help_coin_balance INT DEFAULT 0,
    warning_count INT DEFAULT 0,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 2: MUNICIPAL OFFICIALS (Solvers)
CREATE TABLE public.municipal_officials (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    employee_id TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    jurisdiction_area TEXT NOT NULL,
    help_coin_wallet INT DEFAULT 0,
    current_tier tier_enum DEFAULT 'bronze',
    monthly_resolutions INT DEFAULT 0,
    avg_community_rating FLOAT DEFAULT 0.0,
    avg_resolution_speed_score FLOAT DEFAULT 0.0,
    composite_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 3: TICKETS (Social Posts & Gigs)
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    severity severity_enum NOT NULL,
    status ticket_status_enum DEFAULT 'open',
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    location geography(Point, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) STORED,
    reported_area TEXT,
    before_image_url TEXT NOT NULL,
    after_image_url TEXT,
    solver_id UUID REFERENCES public.municipal_officials(id) ON DELETE SET NULL,
    bounty_amount INT DEFAULT 0,
    upvote_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- TABLE 4: TICKET UPVOTES (Junction)
CREATE TABLE public.ticket_upvotes (
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (ticket_id, user_id)
);

-- TABLE 5: TRANSACTIONS (Audit Trail)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES public.municipal_officials(id) ON DELETE SET NULL,
    amount INT NOT NULL,
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
    type transaction_type_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 6: MONTHLY BUDGETS
CREATE TABLE public.monthly_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_area TEXT NOT NULL,
    month DATE NOT NULL,
    total_coins_allocated INT NOT NULL,
    coins_distributed INT DEFAULT 0,
    coins_remaining INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 7: LEADERBOARD SNAPSHOTS
CREATE TABLE public.leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    official_id UUID REFERENCES public.municipal_officials(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    rank INT NOT NULL,
    composite_score FLOAT NOT NULL,
    pool_bonus_earned INT DEFAULT 0,
    tier_bonus_total INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES
-- ==============================================================================
CREATE INDEX idx_tickets_location ON public.tickets USING GIST (location);
CREATE INDEX idx_tickets_status ON public.tickets (status);
CREATE INDEX idx_tickets_area ON public.tickets (reported_area);
CREATE INDEX idx_tickets_solver ON public.tickets (solver_id);
CREATE INDEX idx_transactions_receiver ON public.transactions (receiver_id);
CREATE INDEX idx_leaderboard_month ON public.leaderboard_snapshots (month);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipal_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------
--  Table: communities
-- -------------------------------------------------
create table public.communities (
  id            uuid default uuid_generate_v4() primary key,
  name          text not null unique,
  description   text,
  area          text,
  created_by    uuid not null references auth.users(id) on delete cascade,
  created_at    timestamp with time zone default now()
);

-- -------------------------------------------------
--  Table: community_members
-- -------------------------------------------------
create table public.community_members (
  community_id  uuid not null references public.communities(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text check (role in ('admin','member')) not null default 'member',
  primary key (community_id, user_id)
);

-- -------------------------------------------------
--  Table: initiatives
-- -------------------------------------------------
create table public.initiatives (
  id            uuid default uuid_generate_v4() primary key,
  community_id  uuid not null references public.communities(id) on delete cascade,
  title         text not null,
  description   text,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0,
  status        text not null check (status in ('Funding','Active','Completed')) default 'Funding',
  created_by    uuid not null references auth.users(id) on delete cascade,
  created_at    timestamp with time zone default now()
);

-- -------------------------------------------------
--  Table: initiative_pledges
-- -------------------------------------------------
create table public.initiative_pledges (
  id            uuid default uuid_generate_v4() primary key,
  initiative_id uuid not null references public.initiatives(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  amount        numeric not null check (amount > 0),
  pledged_at    timestamp with time zone default now()
);

-- -------------------------------------------------
--  RPC: pledge_to_initiative (atomic transaction)
-- -------------------------------------------------
create or replace function public.pledge_to_initiative(
    p_user_id      uuid,
    p_initiative_id uuid,
    p_amount       numeric
) returns void
language plpgsql
security definer
as $$
declare
  v_current_amount numeric;
  v_target_amount  numeric;
  v_user_balance   numeric;
begin
  -- Verify user balance
  select help_coin_balance into v_user_balance
  from public.users
  where id = p_user_id
  for update;

  if v_user_balance < p_amount then
    raise exception 'Insufficient Help Coins';
  end if;

  -- Verify initiative and fetch amounts
  select current_amount, target_amount
    into v_current_amount, v_target_amount
  from public.initiatives
  where id = p_initiative_id
  for update;

  if v_current_amount is null then
    raise exception 'Initiative not found';
  end if;

  -- Deduct from user wallet
  update public.users
    set help_coin_balance = help_coin_balance - p_amount
  where id = p_user_id;

  -- Record pledge
  insert into public.initiative_pledges (initiative_id, user_id, amount)
  values (p_initiative_id, p_user_id, p_amount);

  -- Update initiative current amount and possibly status
  update public.initiatives
    set current_amount = v_current_amount + p_amount,
        status = case
                  when (v_current_amount + p_amount) >= v_target_amount then 'Active'
                  else status
                end
  where id = p_initiative_id;

  -- Notify admins if funded
  if (v_current_amount + p_amount) >= v_target_amount then
    perform pg_notify('initiative_funded', p_initiative_id::text);
  end if;
end;
$$;

-- Grant execution rights
grant execute on function public.pledge_to_initiative to authenticated;

-- Basic Policies (Public Read, Auth Scoped Writes)
-- In a real prod app, these would be tighter. For now, we allow authenticated users to read and insert.

-- Users
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Officials
CREATE POLICY "Official profiles viewable by everyone." ON public.municipal_officials FOR SELECT USING (true);
CREATE POLICY "Officials can insert own profile." ON public.municipal_officials FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Officials can update own profile." ON public.municipal_officials FOR UPDATE USING (auth.uid() = id);

-- Tickets
CREATE POLICY "Tickets are viewable by everyone." ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tickets." ON public.tickets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors or Solvers can update tickets." ON public.tickets FOR UPDATE USING (auth.uid() = author_id OR auth.uid() = solver_id);

-- Upvotes
CREATE POLICY "Upvotes are viewable by everyone." ON public.ticket_upvotes FOR SELECT USING (true);
CREATE POLICY "Users can insert own upvotes." ON public.ticket_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own upvotes." ON public.ticket_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Transactions, Budgets, Leaderboards (Read Only for public, backend inserts)
CREATE POLICY "Transactions viewable by everyone." ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Budgets viewable by everyone." ON public.monthly_budgets FOR SELECT USING (true);
CREATE POLICY "Leaderboards viewable by everyone." ON public.leaderboard_snapshots FOR SELECT USING (true);
