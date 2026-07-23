# 项目设置说明

## 1. 项目概述
这是一个暑期游戏推荐网站，使用 Vue 3 + Vite 重构，并将数据存储从 localStorage 迁移到 Supabase 云数据库。

## 2. 安装依赖

```bash
npm install
```

## 3. Supabase 设置

### 3.1 创建 Supabase 项目
1. 访问 [https://supabase.com](https://supabase.com) 并注册/登录
2. 创建一个新项目
3. 等待项目配置完成

### 3.2 获取 API 密钥
1. 在 Supabase 项目中，进入 Settings → API
2. 复制 `Project URL` 和 `anon public` 密钥
3. 将这些值填入 `.env` 文件：

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3.3 创建数据库表
有两种方法：

#### 方法一：使用 SQL 编辑器
1. 在 Supabase 项目中，进入 SQL Editor
2. 复制 `supabase/migrations/001_create_games_table.sql` 文件的内容
3. 粘贴到 SQL Editor 中并运行

#### 方法二：使用 Supabase CLI
如果你已安装 Supabase CLI，可以使用迁移文件。

## 4. 运行项目

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 5. 访问应用
打开浏览器访问 `http://localhost:3000`

### 进入后台管理
连续点击标题 5 次即可进入 CMS 后台管理页面。

## 6. 数据迁移
如果原项目在 localStorage 中有数据，可以通过 CMS 后台重新添加，或者创建一个临时的迁移功能。

## 项目结构
```
goproject/
├── src/
│   ├── components/
│   │   ├── ClientView.vue      # 客户端视图
│   │   ├── AdminView.vue       # CMS 后台视图
│   │   ├── GameCard.vue        # 游戏卡片组件
│   │   ├── DetailPanel.vue     # 详情面板组件
│   │   └── ImageCarousel.vue   # 图片轮播组件
│   ├── services/
│   │   └── supabase.js         # Supabase 数据服务
│   ├── App.vue                 # 主应用组件
│   └── main.js                 # 应用入口
├── supabase/
│   └── migrations/
│       └── 001_create_games_table.sql
├── index.html
├── vite.config.js
├── package.json
└── .env                        # 需要配置
```
