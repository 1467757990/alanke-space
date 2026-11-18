import type { TrackDescriptor } from "@/types/musicConfig";

/**
 * 侧栏音乐本地曲目数据源。
 * 遵循「零额外负担」原则：配置与数据解耦，此处专用于管理本地曲目列表。
 *
 * 添加曲目：在 musicTracks 中追加一项即可：
 * - id: 唯一标识
 * - title: 曲目标题
 * - artist: 艺术家（可选）
 * - cover: 封面图地址（可选；推荐相对 /src，亦支持 /public 或绝对 URL）
 * - source: 音频文件地址（相对 /public 或绝对 URL）
 * - duration: 曲目时长（秒，可选）
 */
export const musicTracks: readonly TrackDescriptor[] = [
	{
		id: "paper-moon",
		title: "Paper Moon",
		artist: "Alanke Audio",
		album: "Quiet Hours",
		cover: "assets/images/music/cover/paper-moon.webp",
		source: "/assets/music/url/paper-moon.mp3",
		duration: 80,
		lyrics: `[00:00] Paper Moon
[00:12] A quiet light above the desk
[00:28] Folding the evening into code
[00:44] Nothing to prove, nothing to rush
[01:02] Just a soft loop of blue and dusk`,
	},
	{
		id: "night-train",
		title: "Night Train",
		artist: "Alanke Audio",
		album: "Quiet Hours",
		cover: "assets/images/music/cover/night-train.webp",
		source: "/assets/music/url/night-train.mp3",
		duration: 84,
		lyrics: `[00:00] Night Train
[00:15] Windows full of passing lights
[00:34] A slow pulse under the noise
[00:53] Carry the thought a little further
[01:12] Then let it go`,
	},
	{
		id: "quiet-loop",
		title: "Quiet Loop",
		artist: "Alanke Audio",
		album: "Room Tone",
		cover: "assets/images/music/cover/quiet-loop.webp",
		source: "/assets/music/url/quiet-loop.mp3",
		duration: 74,
		lyrics: `[00:00] Quiet Loop
[00:18] Four chords, one open window
[00:40] The room breathes in and out
[01:00] Stay here for a while`,
	},
	{
		id: "soft-static",
		title: "Soft Static",
		artist: "Alanke Audio",
		album: "Room Tone",
		cover: "assets/images/music/cover/soft-static.webp",
		source: "/assets/music/url/soft-static.mp3",
		duration: 78,
		lyrics: `[00:00] Soft Static
[00:20] Warm noise, a thin horizon
[00:42] Signals arriving without urgency
[01:05] Keep the channel open`,
	},
];

/** 音乐空间页的文案内容（与曲目数据分离，便于替换个人介绍）。 */
export const musicProfile = {
	title: "音乐空间",
	description:
		"一些自己生成的氛围音，适合阅读、写代码或发呆时循环播放。所有曲目均为本项目原创合成的演示音源。",
	note: "本地音源 · 无第三方接口 · 首次播放需要你点击播放按钮",
};
