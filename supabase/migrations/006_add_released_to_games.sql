alter table public.games
add column if not exists released boolean default true;
