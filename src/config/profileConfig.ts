import type { ProfileConfig } from "@/types/config";
import { withUserConfig } from "../utils/config-overlay.ts";

/**
 * 博主资料：头像 / 名称 / 简介 / 社交链接（侧栏 Profile 卡片、页脚、RSS 作者等消费）。
 * 类型见 src/types/config.ts。
 */
export const profileConfig: ProfileConfig = withUserConfig("profile", {
	avatar: "assets/images/alanke-avatar.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Alanke",
	bio: "计算机硕士，关注 RAG、Agent 与 NLP。记录技术探索、科研实践，以及生活里的音乐与光。",
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			// TODO: replace with your GitHub profile URL. A bare github.com link is
			// intentionally used instead of inventing an account.
			url: "https://github.com/",
		},
		{
			name: "RSS",
			icon: "material-symbols:rss-feed-rounded",
			url: "/rss.xml",
		},
	],
});
