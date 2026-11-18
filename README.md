# Alanke's Space

一个面向个人长期维护的 **数字花园（Personal Digital Garden）**：技术博客 + 音乐空间 + 生活相册 + 生活动态 + 开发者作品集。

站点基于开源主题 [Shirone](https://github.com/LyraVoid/Shirone) 二次开发，保留其 Material 3 Expressive 设计系统、Astro 内容管线、Pagefind 搜索、Swup 持久壳与无障碍支持，并在此基础上加入个人首页、全局音乐播放器、独立音乐页、项目详情页与本地化示例内容。

- 技术栈：Astro 7 · Svelte 5 · TypeScript · Tailwind CSS 4 · Stylus · Markdown / MDX
- 搜索：Pagefind（生产构建时生成）
- 部署：纯静态 `dist/`，目标平台 Cloudflare Pages
- 许可：MIT（上游版权与许可说明保留在 [`LICENSE`](./LICENSE)）

> 当前站点中的头像、GitHub 链接、项目仓库/演示链接、相册照片、音乐与简历均为**可替换的占位内容**。
> 没有编造论文成果、实验指标、真实联系方式和生产数据。

## 页面

| 路径 | 说明 |
| --- | --- |
| `/` | 个人数字花园首页：Hero、最近文章、精选项目、动态、相册、音乐推荐 |
| `/posts/` | 博客索引；文章详情保留在 `/posts/<slug>/` |
| `/music/` | 音乐空间：完整播放器、播放队列、最近播放、歌词 |
| `/albums/` | 相册索引；`/albums/<id>/` 为瀑布流相册详情 |
| `/moments/` | 生活动态时间线（Markdown 驱动） |
| `/projects/` | 作品集；`/projects/<key>/` 为项目详情 |
| `/about/` | 关于页（`src/content/spec/about.md`） |
| `/archive/`、`/categories/`、`/tags/` | 归档、分类、标签 |
| `/rss.xml`、`/atom.xml`、`/sitemap-index.xml` | RSS、Atom、Sitemap |

## 本地运行

环境要求以仓库真实配置为准：

- Node.js **>= 26.13.0**（`.nvmrc` 固定为 `26.13.0`）
- pnpm **11.28.2**（`packageManager` 锁定）

```bash
# 建议用 nvm / fnm 切换到 Node 26
corepack enable
pnpm install --frozen-lockfile
pnpm dev
# http://localhost:4321
```

生产构建与预览：

```bash
pnpm build
pnpm preview
```

> 这个 fork 保留了名为 `upstream` 的远程仓库，指向 LyraVoid/Shirone；
> 没有配置 `origin`。部署前请按 `docs/DEPLOYMENT.md` 添加你自己的 GitHub 仓库作为 `origin`，
> 本仓库不会自动推送到任何远端。


`pnpm build` 会生成静态页面、Pagefind 索引，并检查中文字体子集体积。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 开发服务器 |
| `pnpm build` | 生产构建到 `dist/`（含 Pagefind 与字体检查） |
| `pnpm preview` | 预览生产构建 |
| `pnpm check` | Astro 诊断（0 errors） |
| `pnpm type-check` | TypeScript `--isolatedDeclarations` 检查 |
| `pnpm check:manifest` | 组件 / Markdown / AI skills 清单校验 |
| `pnpm new-post <filename>` | 创建文章骨架 |
| `pnpm format` / `pnpm lint` | Biome 格式化 / 自动修复（会写文件） |
| `pnpm test` | Playwright 全量测试（需要浏览器；上游用例针对旧演示内容） |
| `npx playwright test tests/site/alanke-smoke.spec.ts` | 本站关键路径冒烟测试 |

## 目录结构（节选）

```text
.
├── astro.config.mjs          # 只做接线，实际集成在 src/integration/
├── src/
│   ├── config/               # 站点、导航、侧栏、音乐、项目等行为配置
│   ├── data/                 # 项目、音乐、首页文案等具体内容
│   ├── content/
│   │   ├── posts/            # 博客 Markdown / MDX
│   │   ├── moments/          # 生活动态 Markdown
│   │   ├── spec/about.md     # 关于页
│   │   └── spec/projects/    # 项目详情长文
│   ├── components/           # atoms / molecules / organisms（沿用上游分层）
│   ├── layouts/              # Layout / MainGridLayout
│   ├── pages/                # 路由
│   ├── styles/               # M3E 设计令牌、全局样式
│   └── utils/music/          # 共享音乐 runtime / 封面 / 最近播放
├── public/
│   ├── assets/               # 项目封面、动态图片、音乐封面与音源
│   ├── images/albums/        # 相册目录（info.json + 图片）
│   ├── images/uploads/       # CMS 上传的图片
│   ├── admin/                # Sveltia CMS 静态入口与配置
│   ├── logo/                 # favicon
│   └── resume.pdf            # 占位简历，待替换
├── docs/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── DEPLOYMENT.md
│   └── ...                   # 上游架构/组件/Markdown 文档
└── dist/                     # 构建产物（git 忽略）
```

## 内容维护

### 内容工作台（新建文章 / 上传图片）

站点提供基于 Git 的 [Sveltia CMS](https://sveltiacms.app/) 管理入口，不需要数据库：

```text
开发环境：http://localhost:4321/admin/index.html
生产环境：https://<你的域名>/admin/
```

本地在 Chrome/Edge 中打开后，点击 **“使用本地仓库”**，选择项目根目录即可新建文章、
编辑正文、上传封面和正文图片。保存会写入：

- 文章：`src/content/posts/`
- 动态：`src/content/moments/`
- 图片：`public/images/uploads/`
- 关于页：`src/content/spec/about.md`

部署后在线编辑需要先在 `public/admin/config.yml` 填写 GitHub 仓库，
然后使用 GitHub PAT 或 OAuth 登录。完整步骤、权限配置与限制见
[`docs/CONTENT_STUDIO.md`](./docs/CONTENT_STUDIO.md)。

### 手动写文章

把 Markdown / MDX 放到 `src/content/posts/`。文章 frontmatter 参考：

```yaml
---
title: "文章标题"
published: 2026-11-01
description: "摘要"
image: /assets/posts/example.webp
tags: [RAG, LLM]
category: RAG
draft: false
---
```

当前 5 篇文章均为 **Demo 示例**，用于验证代码高亮、数学公式、Mermaid、目录、搜索与相关文章。
正式发布前请替换内容并删除 `Demo` 标记。

### 音乐

- 曲目数据：`src/data/music.ts`
- 音频：`public/assets/music/url/*.mp3`
- 封面：`public/assets/music/cover/*.webp`
- 配置：`src/config/musicConfig.ts`（当前为 `provider: "local"`）

四首曲目均为本项目用合成器生成的原创示例音频，不包含商业歌曲，也不依赖 Meting/第三方下载接口。
播放器使用共享 `getMusicRuntime()` 单例：全局悬浮播放器、`/music/` 页面与（可选的）侧栏播放器不会创建重复 `<audio>`。
浏览器自动播放限制通过“用户点击后才播放”处理。

### 相册

每个相册是 `public/images/albums/<id>/`：

```text
public/images/albums/daily-life/
├── info.json
├── cover.webp
├── morning.webp
└── afternoon.webp
```

`info.json` 支持 `title`、`description`、`date`、`location`、`tags`、`layout`、`columns`、`hidden`、`password`。
也支持 `"mode": "external"` 的远程/图床模式，为后续 Cloudflare R2 预留；第一版不依赖 R2。
当前 5 个相册及其图片都是生成的占位图，请替换为你的照片。

### 动态

`src/content/moments/*.md`，字段：`published`、`pinned`、`location`、`mood`、`tags`、`images`、`draft`。

### 项目

- 卡片元信息：`src/data/projects.ts`
- 详情长文：`src/content/spec/projects/<key>.md`
- 页面开关 / 分类：`src/config/projectsConfig.ts`

Q-Restore、司法事件检测、传统建筑知识图谱系统、AI Agent Lab 均只填写了已知方向与通用介绍；
仓库、演示、指标、论文信息没有提供的都留空或标注“待补充”。

### 首页文案与个人信息

- 首页 Hero：`src/data/home.ts`
- 头像、名称、简介、社交链接：`src/config/profileConfig.ts`
- 站点标题、URL、语言、主题色、Banner：`src/config/siteConfig.ts`
- 导航：`src/config/navBarConfig.ts`
- 侧栏：`src/config/sidebarConfig.ts`

## 验证

已验证：`pnpm check`、`pnpm type-check`、`pnpm check:manifest`、`pnpm check:package-manifest`、`pnpm build`、`pnpm exec biome ci ./src`，以及 `npx playwright test tests/site/alanke-smoke.spec.ts`。详细结果与限制见 [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md)。

## 部署

完整的 Cloudflare Pages 步骤、自定义域名、HTTPS、自动部署、常见错误和大陆访问注意事项见
[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)。

快速设置：

- Build command：`pnpm build`
- Output directory：`dist`
- `NODE_VERSION=26`
- `PNPM_VERSION=11.28.2`

部署前把 `src/config/siteConfig.ts` 的 `site` 改为你的最终域名，然后重新构建。

## 仍需替换的占位内容

- 头像：`src/assets/images/alanke-avatar.webp`
- GitHub 主页：`src/config/profileConfig.ts` 与 `src/data/home.ts`
- 域名：`src/config/siteConfig.ts`
- 项目仓库 / 演示 / 截图 / 真实结果：`src/data/projects.ts` 与 `src/content/spec/projects/`
- 相册照片：`public/images/albums/`
- 音乐：`src/data/music.ts` 与 `public/assets/music/`
- 简历：`public/resume.pdf`

## 上游与致谢

- 上游主题：[LyraVoid/Shirone](https://github.com/LyraVoid/Shirone)
- 上游文档：[docs.shirone.mysqil.com](https://docs.shirone.mysqil.com/)
- Shirone 最初基于 [saicaca/Fuwari](https://github.com/saicaca/fuwari) 重构

本仓库保留 MIT [`LICENSE`](./LICENSE) 与上游版权说明。二次开发部分的实现与个人内容遵循同一 MIT 许可。
