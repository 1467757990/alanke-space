# 内容工作台（Sveltia CMS）

站点是纯静态 Astro 项目，没有数据库，也没有常驻后端的“上传接口”。
内容管理使用 **Git-based CMS**：在 `/admin/` 里编辑文章、上传图片，
保存时写入本地文件或提交到 GitHub，Cloudflare Pages 再自动构建。

本次接入的是 [Sveltia CMS](https://sveltiacms.app/) `0.269.0`（MIT），
入口在 `public/admin/`，不依赖 Netlify/Decap 的代理服务。

## 一、本地使用（现在就能用）

要求：

- 使用 **Chrome / Edge / Brave** 等 Chromium 浏览器（本地工作流依赖 File System Access API）；
- 项目已经是一个 Git 仓库（本仓库已有 `.git`）；
- 先运行开发服务器。

```bash
cd /Users/lanjiawei/Projects/alanke-space
nvm use 26.13.0
pnpm dev
```

打开：

```text
http://localhost:4321/admin/index.html
```

然后：

1. 点击 **“使用本地仓库”**；
2. 在弹出的目录选择框里选择项目根目录（包含 `.git` 的 `alanke-space` 文件夹）；
3. 在左侧选择 **博客文章 / 生活动态 / 关于页面**；
4. 新建文章、编辑正文、点击封面图或正文图片上传；
5. 保存。文件会直接写入项目：
   - 文章：`src/content/posts/*.md`
   - 动态：`src/content/moments/*.md`
   - 图片：`public/images/uploads/`
   - 关于页：`src/content/spec/about.md`

Astro 开发服务器会自动热更新；刷新前台页面即可看到新内容。

> `/admin/index.html` 而不是 `/admin/`：Astro 开发服务器不会为 `public/` 下的文件夹路径自动补 `index.html`。
> 生产部署后通常可以直接访问 `/admin/`。

## 二、上传图片

- 图片会上传到 `public/images/uploads/`，前台 URL 为 `/images/uploads/...`；
- 文章“封面图”字段、Markdown 正文里的图片、动态图片都使用同一个媒体库；
- 建议上传 WebP/JPG/PNG，单张控制在 1–2 MB 以内；
- 上传的图片是仓库文件，会随 Git 提交一起部署，不需要 R2。

相册有独立的目录结构和 `info.json`，目前仍推荐按
[`public/images/albums/README.md`](../public/images/albums/README.md) 手动维护；
如果以后要把相册也搬进 CMS，可以再增加 `public/images/albums` 的 JSON collection。

## 三、部署后在线编辑

`public/admin/config.yml` 里的 `backend.repo` 目前是占位：

```yaml
backend:
  name: github
  repo: your-github-username/alanke-space
  branch: main
```

上线前改成你的真实 GitHub 仓库，例如 `alanke/alanke-space`。

### 方式 A：GitHub PAT（最快）

1. 打开 `/admin/`；
2. 点击 **“使用访问令牌登录”**；
3. 按提示创建一个有该仓库 **Contents: Read and write** 权限的 fine-grained token
   （经典 token 需要 `repo` scope）；
4. 粘贴登录。

Token 由 Sveltia CMS 保存在当前浏览器的 localStorage 中。只在自己的电脑上使用，
不要在公共电脑上保存。

### 方式 B：OAuth（更适合长期使用）

1. 按 [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) 部署一个
   Cloudflare Worker；
2. 在 `config.yml` 的 `backend` 下设置：

```yaml
base_url: https://your-sveltia-auth.workers.dev
```

3. 用 GitHub App 登录。这样不用把 PAT 放在浏览器里，权限也可以限制到单个仓库。

在线保存会直接 commit 到 GitHub；Cloudflare Pages 收到推送后自动重新构建。
如果 `main` 分支有保护规则，建议使用 CMS 的 Editorial Workflow 或允许机器人提交。

## 四、注意事项

- **本地模式不会执行 `git add/commit`**（除非在 CMS 设置里开启 “Commit Changes to Git”），
  保存后仍需自己提交并推送。
- 只支持 Chromium 浏览器；Safari/Firefox 不能用本地目录工作流，但仍可登录 GitHub 在线编辑。
- `/admin/` 是公开静态页面，真正的写权限由 GitHub 登录控制；如需进一步保护，
  可以在 Cloudflare 侧加 Access 策略。
- 删除文章会删除本地/GitHub 文件，操作前请确认；没有回收站。
- 当前 CMS 只管理文章、动态和关于页；项目元数据在 `src/data/projects.ts`，
  项目长文在 `src/content/spec/projects/`，相册在 `public/images/albums/`。
- CMS 脚本已 vendored 到 `public/admin/sveltia-cms.js`（约 2.5 MB），
  不依赖外部 CDN，也不影响前台页面性能。

## 五、常见问题

| 现象 | 处理 |
| --- | --- |
| 打开 `/admin/` 404 | 开发时用 `/admin/index.html`；确认 `public/admin/index.html` 存在 |
| 提示配置错误 | 检查 `public/admin/config.yml` 缩进和字段；`slug.timezone` 只能为 `local` 或 `utc` |
| 选择目录时报“not a repository root” | 选择包含 `.git` 的项目根目录 |
| 保存文章后构建失败 | 检查 `published` 日期、`tags` 数组和 `image` 路径；与 `src/content.config.ts` 对齐 |
| 在线登录失败 | 确认 repo 名称、分支、token 的 Contents 写权限 |
| 上传图片后前台不显示 | 确认图片在 `public/images/uploads/`，路径以 `/images/uploads/` 开头 |
