# 暑期「游戏浪一夏」 - 游戏推荐网站

一个现代化的游戏推荐网站，使用 Vue 3 + Vite 构建，支持 Supabase 云数据库存储。

## ✨ 功能特点

- 🎮 精美的游戏卡片展示
- 📱 响应式设计（支持移动端和桌面端）
- 🔄 流畅的游戏详情面板
- 🛠️ CMS 后台管理系统
- ☁️ 支持 Supabase 云数据库
- 💾 本地存储降级方案
- 🎠 图片轮播组件

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env`，并填写您的 Supabase 配置：

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 初始化数据库

在 Supabase SQL Editor 中运行 `supabase/migrations/001_create_games_table.sql` 文件。

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 构建生产版本

```bash
npm run build
```

## 📝 使用说明

### 进入后台管理

连续点击页面标题 5 次即可进入 CMS 后台管理界面。

### 功能说明

- **浏览游戏**：在首页浏览所有推荐游戏
- **查看详情**：点击游戏卡片查看详细信息
- **管理游戏**：进入后台可以添加、编辑、删除游戏

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **数据库**：Supabase
- **样式**：Tailwind CSS
- **图标**：Font Awesome

## 📁 项目结构

```
goproject/
├── src/
│   ├── components/
│   │   ├── ClientView.vue      # 客户端视图
│   │   ├── AdminView.vue       # CMS 后台视图
│   │   ├── GameCard.vue        # 游戏卡片
│   │   ├── DetailPanel.vue     # 详情面板
│   │   └── ImageCarousel.vue   # 图片轮播
│   ├── services/
│   │   └── supabase.js         # Supabase 数据服务
│   ├── App.vue                 # 主应用
│   └── main.js                 # 入口文件
├── supabase/
│   └── migrations/
│       └── 001_create_games_table.sql
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🔧 Supabase 设置

1. 访问 [Supabase](https://supabase.com) 创建项目
2. 获取 Project URL 和 Anon Key
3. 在 SQL Editor 中运行迁移文件
4. 配置环境变量

## 📄 许可证

MIT
