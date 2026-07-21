alter table public.games
add column if not exists sort_order integer default 0;
