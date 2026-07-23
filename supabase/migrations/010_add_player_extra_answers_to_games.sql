alter table public.games
add column if not exists player_extra_answers jsonb default '[]'::jsonb;
