create table if not exists activities (
  id text primary key,
  title text not null,
  nav_title text not null,
  banner_url text,
  banner_link text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activity_games (
  activity_id text not null references activities(id) on delete cascade,
  game_id text not null references games(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (activity_id, game_id)
);

alter table activities enable row level security;
alter table activity_games enable row level security;

create policy "Allow public activity access" on activities for all using (true) with check (true);
create policy "Allow public activity game access" on activity_games for all using (true) with check (true);
