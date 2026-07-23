CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    team TEXT NOT NULL,
    type TEXT,
    price TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    cover TEXT NOT NULL,
    screenshots JSONB DEFAULT '[]'::jsonb,
    target_url TEXT,
    date TEXT,
    description TEXT,
    zhihu_author TEXT,
    zhihu_avatar TEXT,
    zhihu_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取数据
CREATE POLICY "Allow public read access" ON games
    FOR SELECT USING (true);

-- 创建策略：允许所有人插入数据
CREATE POLICY "Allow public insert access" ON games
    FOR INSERT WITH CHECK (true);

-- 创建策略：允许所有人更新数据
CREATE POLICY "Allow public update access" ON games
    FOR UPDATE USING (true) WITH CHECK (true);

-- 创建策略：允许所有人删除数据
CREATE POLICY "Allow public delete access" ON games
    FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO games (id, title, team, type, price, color, cover, screenshots, target_url, date, description, zhihu_author, zhihu_avatar, zhihu_content) VALUES
(
    '1700000001',
    '绍宋：还我河山',
    '互动之星开发组',
    '影视互动游戏',
    '18.20',
    '#8b5cf6',
    'https://placehold.co/600x340/3f3f46/ffffff?text=Zhao+Song+Cover',
    '["https://placehold.co/800x600/475569/ffffff?text=Screenshot+1","https://placehold.co/800x600/334155/ffffff?text=Screenshot+2","https://placehold.co/800x600/1e293b/ffffff?text=Screenshot+3"]'::jsonb,
    'https://store.steampowered.com/',
    '2026.8',
    '这是一沉浸式真人互动历史权谋影视游戏！你将化身赵玖，魂穿南宋最具争议的皇帝赵构，每次抉择都将左右王朝气运、定夺天下兴亡！面对靖康之变后的山河破碎，你能否打破宿命再造山河？',
    '李制作 (制作人)',
    'https://placehold.co/100x100/fbbf24/000000?text=Dev',
    '开发这款游戏最大的乐趣在于历史的推演。我们在剧本上花费了数年时间，考证了大量的宋史资料。最核心的玩法是“势”，玩家不仅要在朝堂上平衡文武，还要考虑到金国的军事压力。每一次在选项前的犹豫，都是我们希望带给玩家的历史沉重感。'
),
(
    '1700000002',
    '隐形守护者',
    'NewOne Studio',
    '谍战互动影像',
    '38.00',
    '#0f766e',
    'https://placehold.co/600x340/1c1917/ffffff?text=Invisible+Guardian',
    '["https://placehold.co/800x600/000000/ffffff?text=Spy+Game+Pic+1"]'::jsonb,
    'https://store.steampowered.com/',
    '2019.1',
    '你叫肖途，两年前的你，还是上海一个名噪一时的爱国学生。现在，你成为了潜伏在敌后的一名谍报人员。你的每一个选择都生死攸关。',
    '谍战策划组',
    'https://placehold.co/100x100/10b981/ffffff?text=Spy',
    '为了还原那个年代的质感，所有的服装、道具都是定制的。我们希望玩家不仅是在玩游戏，更像是在经历一部能够自己主导结局的谍战大片。'
),
(
    '1700000003',
    '飞越13号房',
    'ALT Lab',
    '悬疑逃生',
    '42.00',
    '#b45309',
    'https://placehold.co/600x340/451a03/ffffff?text=Room+13',
    '["https://placehold.co/800x600/27272a/ffffff?text=Escape+1","https://placehold.co/800x600/3f3f46/ffffff?text=Escape+2"]'::jsonb,
    'https://store.steampowered.com/',
    '2023.1',
    '属于中国青年的悬疑互动影像作品。背景设定在21世纪初，你将扮演一名驰骋游戏世界的叛逆少年，被送入了一所行为矫正中心。',
    'ALT主策',
    'https://placehold.co/100x100/dc2626/ffffff?text=ALT',
    '这不是一个轻松的故事。我们深入调查了许多真实的案例。游戏里最难的设计是如何在绝望中给玩家留下一线生机，以及同伴之间的羁绊和背叛。'
);
