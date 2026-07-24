create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke all on table public.admin_users from anon;
revoke insert, update, delete, truncate, references, trigger on table public.admin_users from authenticated;
grant select on table public.admin_users to authenticated;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('admin_users', 'games', 'activities', 'activity_games', 'site_settings')
  loop
    execute format('drop policy if exists %I on %I.%I', policy_record.policyname, policy_record.schemaname, policy_record.tablename);
  end loop;
end
$$;

create policy "Users can read their own admin membership"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

do $$
declare
  table_name text;
begin
  foreach table_name in array array['games', 'activities', 'activity_games', 'site_settings']
  loop
    if to_regclass(format('public.%I', table_name)) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke insert, update, delete, truncate, references, trigger on table public.%I from anon', table_name);
    execute format('grant select on table public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on table public.%I to authenticated', table_name);

    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      table_name || '_public_select', table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_admin())',
      table_name || '_admin_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name || '_admin_update', table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_admin())',
      table_name || '_admin_delete', table_name
    );
  end loop;
end
$$;
