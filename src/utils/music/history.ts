/** 本地最近播放记录（只存歌曲 id，最多 8 条；不上传任何数据）。 */
const STORAGE_KEY = "alanke:music-recent";
const LIMIT = 8;

export function readRecentTrackIds(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const parsed: unknown = JSON.parse(
			window.localStorage.getItem(STORAGE_KEY) ?? "[]",
		);
		return Array.isArray(parsed)
			? parsed.filter((id): id is string => typeof id === "string")
			: [];
	} catch {
		return [];
	}
}

export function recordRecentTrack(id: string): string[] {
	const next = [
		id,
		...readRecentTrackIds().filter((item) => item !== id),
	].slice(0, LIMIT);
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	} catch {
		// 存储被禁用时仍可正常播放，只是没有历史记录。
	}
	return next;
}
