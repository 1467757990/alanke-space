/**
 * 构建期音乐封面优化：把 src/assets 封面转成响应式 WebP 候选。
 * 只在 Astro 服务端组件中调用，客户端的共享 runtime 只接收最终 URL。
 */
import { getImage } from "astro:assets";
import { resolveImageAsset } from "@utils/asset-utils";
import type { ResolvedMusicOptions } from "@/config/musicConfig";
import { musicTracks } from "@/data/music";

export async function withOptimizedMusicCovers(
	options: ResolvedMusicOptions,
): Promise<ResolvedMusicOptions> {
	const configuredCovers = new Map(
		musicTracks.map((track) => [track.id.trim(), track.cover] as const),
	);
	return {
		...options,
		playlist: await Promise.all(
			options.playlist.map(async (track) => {
				const configuredCover = configuredCovers.get(track.id) ?? track.cover;
				if (!configuredCover) return track;
				const asset = await resolveImageAsset(configuredCover);
				if (typeof asset === "string") return track;
				const widths = [64, 128, 256, 512].filter(
					(width) => width <= asset.width,
				);
				if (!widths.length) widths.push(asset.width);
				const candidates = await Promise.all(
					widths.map(async (width) => ({
						width,
						image: await getImage({
							src: asset,
							width,
							format: "webp",
							quality: 72,
						}),
					})),
				);
				return {
					...track,
					cover: candidates.at(-1)?.image.src ?? asset.src,
					coverSrcset: candidates
						.map(({ image, width }) => `${image.src} ${width}w`)
						.join(", "),
					coverSizes: "(max-width: 767px) 72vw, 360px",
					coverWidth: asset.width,
					coverHeight: asset.height,
				};
			}),
		),
	};
}
