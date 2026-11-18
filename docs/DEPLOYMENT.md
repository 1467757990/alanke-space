# Alanke's Space — Cloudflare Pages 部署指南

本项目是纯静态 Astro 站点：构建产物在 `dist/`，不需要数据库、服务端运行时或登录系统。
Cloudflare Pages 只负责托管静态文件；所有内容在构建时预渲染。

## 0. 版本要求（以真实配置为准）

| 项目 | 要求 | 来源 |
| --- | --- | --- |
| Node.js | `>= 26.13.0` | `package.json` → `engines.node` |
| pnpm | `11.28.2` | `package.json` → `packageManager` |
| Astro | `7.4.5` | `package.json` |
| 构建命令 | `pnpm build` | `package.json` |
| 输出目录 | `dist` | Astro 静态构建默认输出 |

> 为什么不是更低的 Node 版本：上游 Shirone 的 `engines` 明确要求 `>=26.13.0`，
> 本地开发与 Cloudflare 构建应保持一致，避免 Astro 7 / Vite 8 在旧 Node 上出现不可复现的问题。
> 仓库根目录的 `.nvmrc` 固定为 `26.13.0`，便于本地使用 nvm/fnm 切换。

## 1. 本地生产构建

```bash
# 使用 Node 26.13.0
corepack enable
pnpm install --frozen-lockfile
pnpm build
```

`pnpm build` 会依次执行：

1. `scripts/content/sync.mjs`（单仓库模式下为 no-op）；
2. `astro build`（静态路由、图片优化、RSS / Sitemap）；
3. `pagefind --site dist`（全文搜索索引）；
4. `scripts/fonts/check-fonts.mjs`（中文字体子集体积检查）。

构建完成后可本地预览：

```bash
pnpm preview
# 或
npx serve dist
```

生产搜索索引只存在于 `dist/pagefind/`，在 `pnpm dev` 中搜索会走开发期回退逻辑；
验收搜索功能请使用 `pnpm build && pnpm preview`。

## 2. 推送到 GitHub

> 仓库当前只有 `upstream` remote（指向上游 Shirone），没有 `origin`。
> 下面的命令会添加你自己的 `origin`，不会向上游推送。

```bash
git remote add origin https://github.com/<your-account>/alanke-space.git
git add .
git commit -m "feat: personalize Alanke's Space"
git push -u origin main
```

仓库里不要提交 `.env`、`.dev.vars`、Cloudflare API Token 或任何私钥。
本项目运行时不读取任何密钥；内容同步用的 `CONTENT_REPO_URL` 也只在需要双仓模式时使用。

## 3. Cloudflare Pages 连接

1. 打开 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 授权 GitHub，选择 `alanke-space` 仓库，生产分支选 `main`。
3. 构建设置：
   - **Framework preset**：`Astro`（或 `None`，命令以本文件为准）
   - **Build command**：`pnpm build`
   - **Build output directory**：`dist`
   - **Root directory**：留空（仓库根目录）
4. **Environment variables（Production）**：
   - `NODE_VERSION` = `26`
   - `PNPM_VERSION` = `11.28.2`
   - 可选：`NODE_OPTIONS` = `--max-old-space-size=4096`（内容/图片很多时可加）
5. 保存并 **Deploy**。

若 Cloudflare 使用了较旧的构建镜像，`NODE_VERSION=26` 可能仍落在 26.x 的某个小版本；
本项目要求 `>=26.13.0`。若安装阶段报 engine 错误，请确认 Pages 构建日志中的 Node 实际版本，
必要时在仓库根目录保留 `.nvmrc` / `.node-version`，或联系 Cloudflare 使用支持 Node 26.13+ 的镜像。
不要把 `pnpm-lock.yaml` 删除来“绕过”版本问题。

## 4. 自定义域名与 HTTPS

1. Pages 项目 → **Custom domains** → **Set up a custom domain**。
2. 输入域名（例如 `space.example.com`），按提示添加 DNS 记录：
   - 子域名通常添加 `CNAME` 指向 `<project>.pages.dev`；
   - 根域名按 Cloudflare 的提示使用 CNAME flattening / A 记录。
3. 等待 DNS 生效，Cloudflare 会自动签发并续期 HTTPS 证书。
4. 修改 `src/config/siteConfig.ts` 的 `site` 为最终域名（必须以 `/` 结尾），
   否则 canonical、Open Graph、RSS 与 Sitemap 中的绝对地址会不一致。
5. 重新构建并部署。推荐同时把 `public/robots.txt` 的 Sitemap 地址确认指向新域名
   （该文件由 `src/pages/robots.txt.ts` 在构建期生成）。

## 5. 更新文章后如何自动部署

Pages 的 Git 集成默认会在 `main` 分支有新提交时自动构建。
写作流程：

```bash
# 1. 新建/编辑 Markdown
pnpm new-post my-new-note
# 2. 本地预览
pnpm dev
# 3. 构建检查
pnpm build
# 4. 提交并推送
git add src/content/posts/my-new-note.md
git commit -m "docs(posts): add my new note"
git push
```

Cloudflare 会在推送后自动触发部署。若开了 Preview deployments，
Pull Request 会得到独立的预览地址，合并到 `main` 才更新生产站点。

## 6. 常见构建错误

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `Unsupported engine` / Node 版本过低 | 构建镜像 Node < 26.13.0 | 设置 `NODE_VERSION=26`；核对构建日志中的实际版本 |
| `pnpm: command not found` | 未启用 pnpm | 设置 `PNPM_VERSION=11.28.2`；必要时在构建命令前加 `corepack enable` |
| `ERR_PNPM_OUTDATED_LOCKFILE` | lockfile 与 `package.json` 不一致 | 本地运行 `pnpm install` 后提交新的 `pnpm-lock.yaml` |
| Pagefind 搜索无结果 | 只运行了 `pnpm dev`，或构建被中断 | 使用 `pnpm build && pnpm preview`，确认 `dist/pagefind/` 存在 |
| 中文字体体积超限 | 内容字符集变大，超过默认预算 | 调大 `FONT_MAX_TOTAL_BYTES` / `FONT_MAX_FAMILY_BYTES`，或精简字体角色 |
| 图片构建失败 | 引用了不存在的本地图片/封面 | 检查 `src/content/posts` 的 `image`、相册 `cover.webp` 与 `info.json` |
| `astro telemetry` EPERM | 构建环境不允许写用户目录 | 设置 `ASTRO_TELEMETRY_DISABLED=1`（本地沙箱/CI 常见） |
| 日期校验报错 | `publishedAt` 与 `published` 不在同一站点时区日 | 检查 `siteConfig.timeZone` 与 frontmatter |
| 样式里 `color-mix` / `min()` 报错 | Stylus 把 CSS 函数当自身函数解析 | 在 Stylus 中用 `unquote("...")` 包裹 |
| 页面 404 但本地正常 | 大小写、尾斜杠或 `base` 配置不一致 | 检查 `siteConfig.base` 与链接；不要在 URL 中硬编码大小写 |

## 7. 中国大陆访问说明

Cloudflare Pages 的构建与边缘节点主要在境外。中国大陆访问可能出现：

- 首次连接延迟较高、偶发丢包；
- 某些网络环境下 `*.pages.dev` 域名不稳定；
- 自定义域名 + Cloudflare 代理也不保证大陆访问速度。

可选方案：

1. **保留 Cloudflare Pages 作为主站**，自定义域名并开启缓存；静态资源尽量本地化（本项目已不依赖外部图片/音乐接口）。
2. 使用腾讯云 EdgeOne Pages、Vercel、Netlify 等静态托管做镜像；构建命令与产物不变。
3. 若需要大陆节点并长期运营，需自行评估备案与合规要求，并选择合规的境内 CDN/对象存储。

不要在未确认合规要求的情况下把站点直接指向境内服务器。当前项目没有后端、没有用户数据收集，
部署静态文件本身不涉及数据库迁移。

## 8. 可选：Cloudflare R2 图片存储（第一版不依赖）

第一版所有相册图片都在 `public/images/albums/`，不强制使用 R2。未来迁移时：

1. 在 R2 创建 bucket，绑定自定义公开域名（例如 `images.example.com`）。
2. 新建相册目录，`info.json` 使用外部模式：

```json
{
  "mode": "external",
  "title": "旅行",
  "cover": "https://images.example.com/albums/travel/cover.webp",
  "photos": [
    {
      "src": "https://images.example.com/albums/travel/01.webp",
      "thumbnail": "https://images.example.com/albums/travel/01-thumb.webp",
      "alt": "旅行照片",
      "width": 1600,
      "height": 1067
    }
  ]
}
```

3. 重新构建。相册扫描器会直接使用外链；不需要改组件或增加图片处理服务。
4. 若使用私有 bucket，需要签名 URL 或公开只读域名；不要把 R2 密钥写进前端。

## 9. 内容管理（Sveltia CMS）

`/admin/` 是 Git-based 内容工作台，公开静态页面，不占后端：

1. 部署前把 `public/admin/config.yml` 的 `backend.repo` 改为真实 GitHub 仓库；
2. 本地开发时打开 `/admin/index.html`，用 Chrome/Edge 选择项目根目录即可编辑；
3. 部署后可打开 `https://<域名>/admin/`，用 GitHub PAT（Contents 读写）登录，
   或按 Sveltia 文档部署 OAuth Worker 并设置 `backend.base_url`；
4. 保存后提交到 GitHub，Cloudflare Pages 自动构建；
5. 图片上传到 `public/images/uploads/`，会随仓库一起部署。

完整说明见 [`docs/CONTENT_STUDIO.md`](./CONTENT_STUDIO.md)。
如果希望进一步限制访问，可在 Cloudflare 侧为 `/admin/*` 配置 Access。

## 10. 发布后验收清单

- [ ] 首页、`/posts/`、文章详情、`/music/`、`/albums/`、`/moments/`、`/projects/`、`/about/` 可访问。
- [ ] `/sitemap-index.xml`、`/rss.xml`、`/atom.xml`、`/robots.txt` 返回正确内容。
- [ ] 搜索能返回文章（生产构建 + `pnpm preview`）。
- [ ] 深色模式、移动端导航、音乐播放与页面切换正常。
- [ ] 控制台没有关键 JavaScript 错误。
- [ ] `/admin/index.html` 能加载 Sveltia CMS，且 `config.yml` 无配置错误。
- [ ] `siteConfig.site` 与实际域名一致。
