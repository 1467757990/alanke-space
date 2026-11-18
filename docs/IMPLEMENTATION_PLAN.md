# Alanke's Space — Implementation Plan

Last updated: 2026-11-10

This project is a fork of [Shirone](https://github.com/LyraVoid/Shirone) (MIT), kept in
single-repository source mode so the theme and personal content can evolve together.

## 1. Baseline

- [x] Inspect the empty workspace and upstream repository.
- [x] Clone Shirone `main` (`4e7306c`) as the development base.
- [x] Verify Node.js `>=26.13.0` and pnpm `11.28.2` (upstream `engines` / `packageManager`).
- [x] Install dependencies with the upstream lockfile.
- [x] Build the untouched upstream site successfully (`pnpm build`).

## 2. Brand and global shell

- [x] Set site identity: `Alanke's Space`, Chinese-first content, Asia/Shanghai timezone.
- [x] Apply a blue/lavender Material 3 palette using existing HCT tokens.
- [x] Add the primary navigation: 首页 / 博客 / 音乐 / 相册 / 动态 / 项目 / 关于.
- [x] Add a light glass/gradient visual layer without a second UI library.
- [x] Keep search, theme switching, display settings, i18n and accessibility intact.

## 3. Home page

- [x] Replace the default post-list home page with a personal digital-garden landing page.
- [x] Hero: greeting, short intro, avatar, tags, GitHub and portfolio actions.
- [x] Sections: recent posts, featured projects, latest moments, album highlights, music pick.
- [x] Keep the home page concise and fully responsive.

## 4. Blog

- [x] Keep the upstream Markdown/MDX, code, math, Mermaid, TOC and search pipeline.
- [x] Add `/posts/` as the blog index while keeping `/posts/<slug>/` article routes.
- [x] Replace upstream theme demos with clearly labelled Chinese demo articles.
- [x] Keep RSS, Atom and sitemap output working.

## 5. Music

- [x] Reuse the existing shared music runtime (single audio element, no duplicate players).
- [x] Replace the Meting/copyrighted defaults with original synthesized demo audio.
- [x] Add a persistent global mini player outside the Swup container.
- [x] Add `/music/` with queue, recent plays, recommendations and optional lyrics.
- [x] Respect autoplay restrictions and page-switch lifecycles.
- [x] Add mobile layout, keyboard operation and reduced-motion support.

## 6. Albums, moments and projects

- [x] Replace upstream album demos with local generated placeholder albums in five categories.
- [x] Use the existing masonry layout, lightbox, lazy loading and password support.
- [x] Replace moments with local Markdown entries (date, mood, tags, images).
- [x] Add four honest placeholder projects with no invented links, metrics or papers.
- [x] Add `/projects/<key>/` detail pages backed by Markdown.
- [x] Reserve a PDF resume entry.

## 7. About and personal data

- [x] Add a configurable Chinese about page.
- [x] Keep contact details limited to a generic GitHub placeholder until supplied.
- [x] Centralize site identity, navigation and home copy in config/data.

## 8. Validation

- [x] `pnpm check` (Astro diagnostics).
- [x] `pnpm type-check`.
- [x] `pnpm build` (static output + Pagefind + font budget).
- [x] Responsive/dark-mode/browser checks for the main routes.
- [x] Verify no duplicate music instances during Swup navigation.
- [x] Run relevant Playwright smoke/a11y tests where the local browser is available.

## 9. Content studio (post-implementation request)

- [x] Add a static `/admin/` Sveltia CMS entry with no database or custom backend.
- [x] Support local repository editing (new posts, moments, about, image uploads).
- [x] Configure posts/moments/about collections and `public/images/uploads/`.
- [x] Document GitHub PAT/OAuth online editing and limitations.
- [x] Add a dev-only footer entry and automated CMS smoke test.

## 10. Deployment

- [x] Keep `.gitignore` and `.env.example` free of secrets.
- [x] Document Cloudflare Pages build settings and custom-domain flow in `docs/DEPLOYMENT.md`.
- [x] Document what content still needs the owner's real data.
- [x] Keep the MIT license and upstream attribution.

## Known placeholders

- GitHub URL, avatar, domain, real project links/screenshots and resume PDF are placeholders.
- Album photos and music are original generated demo assets, meant to be replaced.
- No real paper results, experiment metrics or personal contact details are claimed.


## Validation log (2026-11-10)

Executed with Node `26.13.0` + pnpm `11.28.2`:

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | passed |
| `pnpm check` | 0 errors, 0 warnings |
| `pnpm type-check` | passed (only the 4 documented upstream `TS9013` entries) |
| `pnpm check:manifest` | passed (atoms, Markdown, skills, fonts) |
| `pnpm check:package-manifest` | passed |
| `pnpm exec biome ci ./src` | 0 errors, 1 pre-existing warning |
| `pnpm build` | passed: 35 static pages, Pagefind zh-cn index, font budget 459.9 KB / 6144 KB |
| `npx playwright test tests/site/alanke-smoke.spec.ts` | 7/7 passed |
| Production preview browser checks | core routes, search, album lightbox, dark mode, music playback, mobile overflow verified |
| axe-core scans | 0 violations on `/`, `/music/`, a post, `/albums/`, `/projects/q-restore/` |
| Sveltia CMS `/admin/index.html` | loaded with no configuration errors (local/GitHub/token entry points visible) |
| Chinese CMS filename build | a temporary `2026-11-18-测试文章.md` built successfully, then removed |

Notes:

- `pnpm design:lint` could not run because the external `@google/design.md` CLI could not be
  fetched in this environment. Token usage was checked manually against the existing M3E variables.
- The upstream full Playwright suite was not run because it targets the deleted theme demo posts
  and the disabled anime/friends/devices/etc. demo pages. The focused `alanke-smoke.spec.ts`
  covers this site's real routes and interactions.
- Pagefind indexes the 5 public posts (plus other pages carrying `data-pagefind-body`); the draft
  Markdown reference is intentionally excluded from production.

## Handover placeholders

- GitHub URL: `src/config/profileConfig.ts`, `src/data/home.ts`.
- Domain: `src/config/siteConfig.ts` (`site`).
- Avatar: `src/assets/images/alanke-avatar.webp`.
- Projects: `src/data/projects.ts` + `src/content/spec/projects/`.
- Albums: `public/images/albums/`.
- Music: `src/data/music.ts` + `public/assets/music/url/` + `src/assets/images/music/cover/`.
- Resume: `public/resume.pdf`.


## Content studio follow-up (2026-11-18)

- Sveltia CMS `0.269.0` is vendored at `public/admin/sveltia-cms.js` (MIT).
- Local workflow writes to the repository through the browser File System Access API.
- Online workflow uses the GitHub backend with a PAT or an OAuth `base_url`.
- Albums and project metadata remain file/data driven and are documented as manual
  for now; the CMS covers posts, moments, about and uploaded media.
