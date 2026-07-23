alter table activities
  add column if not exists show_in_nav boolean not null default false,
  add column if not exists nav_sort_order integer not null default 0;

update activities
set show_in_nav = true
where is_featured = true;
