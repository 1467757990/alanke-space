# 内容工作台（Sveltia CMS）

- 固定版本：`@sveltia/cms@0.269.0`
- 许可证：MIT（https://github.com/sveltia/sveltia-cms）
- 静态入口：`/admin/`（开发时使用 `/admin/index.html`）
- 配置文件：`config.yml`
- 上传目录：`public/images/uploads/`

`/admin/` 是本项目的 Git-based 内容管理入口。它不依赖数据库：
本地模式直接写项目文件；部署后登录 GitHub，保存会提交到仓库，
Cloudflare Pages 随后自动构建。

详细使用方式、GitHub PAT/OAuth 配置与限制见 [`docs/CONTENT_STUDIO.md`](../../docs/CONTENT_STUDIO.md)。
