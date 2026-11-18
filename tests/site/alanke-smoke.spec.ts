import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Alanke's Space 关键路径冒烟测试。
 * 覆盖：首页/核心路由、音乐播放与 Swup 跨页续播、相册灯箱、
 * 深色模式、移动端无横向溢出，以及首页无障碍扫描。
 */

test("core routes render with a Chinese document", async ({ page }) => {
	const routes = [
		["/", "主页"],
		["/posts/", "博客"],
		["/music/", "音乐空间"],
		["/albums/", "相册"],
		["/moments/", "动态"],
		["/projects/", "项目"],
		["/projects/q-restore/", "Q-Restore"],
		["/about/", "关于"],
		["/posts/rag-from-prototype-to-usable/", "RAG 从原型到可用"],
	] as const;

	for (const [path, title] of routes) {
		await page.goto(path, { waitUntil: "networkidle" });
		await expect(page).toHaveTitle(new RegExp(title));
		await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
	}
});

test("music keeps playing across Swup navigation with one audio source", async ({
	page,
}) => {
	const audioRequests: string[] = [];
	page.on("request", (request) => {
		if (request.url().includes("/assets/music/url/")) {
			audioRequests.push(request.url());
		}
	});

	await page.goto("/music/", { waitUntil: "networkidle" });
	const play = page
		.locator(
			'[data-music-page] button[aria-label="播放"], [data-music-page] button[aria-label="Play"]',
		)
		.first();
	await expect(play).toBeVisible();
	await play.click();

	await expect(
		page.locator(
			'[data-music-page] button[aria-label="暂停"], [data-music-page] button[aria-label="Pause"]',
		),
	).toHaveCount(1);

	await page.locator('header a[href="/about/"]').click();
	await expect(page).toHaveURL(/\/about\/$/);
	const dockPause = page.locator(
		'[data-music-dock] button[aria-label="暂停"], [data-music-dock] button[aria-label="Pause"]',
	);
	await expect(dockPause).toHaveCount(1);
	expect(audioRequests).toHaveLength(1);
});

test("album detail opens the existing lightbox", async ({ page }) => {
	await page.goto("/albums/", { waitUntil: "networkidle" });
	await page.locator(".album-card__link").first().click();
	await expect(page).toHaveURL(/\/albums\/.+\/$/);
	const photo = page.locator(".album-gallery__item").first();
	await expect(photo).toBeVisible();
	await photo.click();
	await expect(page.locator(".fancybox__container")).toHaveCount(1);
});

test("dark mode toggle applies the dark theme", async ({ page }) => {
	await page.goto("/", { waitUntil: "networkidle" });
	await page.locator("#scheme-switch").click();
	await page.locator(".m3-menu-item").nth(1).click();
	await expect(page.locator("html")).toHaveClass(/dark/);
});

test("home page has no serious axe violations", async ({ page }) => {
	await page.goto("/", { waitUntil: "networkidle" });
	await page.waitForTimeout(500);
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
});

test.describe("mobile", () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test("core pages do not overflow horizontally", async ({ page }) => {
		for (const path of [
			"/",
			"/music/",
			"/posts/",
			"/albums/",
			"/projects/q-restore/",
		]) {
			await page.goto(path, { waitUntil: "networkidle" });
			const overflow = await page.evaluate(
				() =>
					document.documentElement.scrollWidth >
					document.documentElement.clientWidth,
			);
			expect(overflow, `${path} overflows`).toBe(false);
		}
	});
});

test("content studio loads without configuration errors", async ({ page }) => {
	await page.goto("/admin/index.html", { waitUntil: "networkidle" });
	await expect(
		page.getByText(/使用本地仓库|Work with Local Repository/),
	).toBeVisible();
	const body = await page.locator("body").innerText();
	expect(body).not.toMatch(
		/CMS 配置中存在错误|Errors? found in (the )?configuration/i,
	);
});
