insert into activities (id, title, nav_title, show_in_nav, is_featured, nav_sort_order, sort_order)
values ('all-games', '全部游戏', '全部游戏', true, false, 0, -1)
on conflict (id) do update
set title = '全部游戏',
    nav_title = '全部游戏',
    show_in_nav = true,
    is_featured = false;
