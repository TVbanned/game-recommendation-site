insert into public.admin_users (user_id)
values ('c1762fbd-fe1b-4305-a34a-a329a719f59f')
on conflict (user_id) do nothing;
