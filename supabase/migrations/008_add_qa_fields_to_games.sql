alter table public.games
add column if not exists developer_question text,
add column if not exists developer_bio text,
add column if not exists player_question text,
add column if not exists player_bio text;
