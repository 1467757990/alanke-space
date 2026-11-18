/**
 * 音乐数据适配层。
 *
 * 真正的曲目数据在 `src/data/music.json`，由 `/admin/` 的 Sveltia CMS 维护；
 * 这个文件只负责给 TypeScript 增加类型，并把 JSON 转成播放器使用的冻结对象。
 * 新增/编辑歌曲时不需要改这个文件。
 */
import type { TrackDescriptor } from "@/types/musicConfig";
import musicData from "./music.json";

export interface MusicProfile {
	title: string;
	description: string;
	note: string;
}

export const musicTracks: readonly TrackDescriptor[] = musicData.tracks.map(
	(track) =>
		Object.freeze({
			...track,
			lyrics: track.lyrics ?? "",
		}),
);

export const musicProfile: MusicProfile = musicData.profile;
