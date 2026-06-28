-- -------------------------------------------------
--  Table: community_posts
-- -------------------------------------------------
create table public.community_posts (
  id            uuid default uuid_generate_v4() primary key,
  community_id  uuid not null references public.communities(id) on delete cascade,
  author_id     uuid not null references auth.users(id) on delete cascade,
  content       text not null,
  created_at    timestamp with time zone default now()
);

-- -------------------------------------------------
--  Table: community_comments
-- -------------------------------------------------
create table public.community_comments (
  id            uuid default uuid_generate_v4() primary key,
  post_id       uuid not null references public.community_posts(id) on delete cascade,
  author_id     uuid not null references auth.users(id) on delete cascade,
  content       text not null,
  created_at    timestamp with time zone default now()
);

-- RLS
alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;

-- Public read for local dev
create policy "public read posts" on public.community_posts for select using (true);
create policy "public read comments" on public.community_comments for select using (true);

-- Allow anyone to post/comment (for ease of local testing, but the app UI/server actions will enforce rules)
create policy "public insert posts" on public.community_posts for insert with check (true);
create policy "public insert comments" on public.community_comments for insert with check (true);
