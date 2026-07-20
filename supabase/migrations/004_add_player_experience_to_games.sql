alter table public.games
add column if not exists player_experience_author text,
add column if not exists player_experience_avatar text,
add column if not exists player_experience_content text;
