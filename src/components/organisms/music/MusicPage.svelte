<script lang="ts">
/**
 * 音乐空间页：完整播放器 + 播放队列 + 最近播放 + 歌词。
 * 通过共享 music runtime 与全局悬浮播放器共用唯一 Audio 实例；
 * 本组件卸载时只退订，不 destroy runtime，因此 Swup 切页不会中断播放。
 */
import IconButton from "@components/atoms/action/IconButton.svelte";
import Icon from "@iconify/svelte";
import type { MusicLabels } from "@utils/music/labels";
import { onMount } from "svelte";
import type { ResolvedMusicOptions } from "@/config/musicConfig";
import type {
	MusicRuntime,
	MusicSnapshot,
	PlaybackMode,
} from "@/types/musicConfig";

interface Props {
	options: ResolvedMusicOptions;
	labels: MusicLabels;
	subtitle: string;
	note?: string;
}

let { options, labels, subtitle, note = "" }: Props = $props();

const initialTrack = options.playlist[0] ?? null;
const initialSnapshot: MusicSnapshot = {
	playlist: options.playlist,
	currentIndex: options.playlist.length ? 0 : -1,
	currentTrack: initialTrack,
	status: "idle",
	currentTime: 0,
	duration: initialTrack?.duration ?? 0,
	volume: options.defaultVolume,
	muted: false,
	mode: options.defaultMode,
	error: options.playlist.length ? null : "empty-playlist",
};

let runtime = $state<MusicRuntime | null>(null);
let snapshot = $state<MusicSnapshot>(initialSnapshot);
let recentIds = $state<string[]>([]);
let recordedId = "";

const current = $derived(snapshot.currentTrack);
const playing = $derived(snapshot.status === "playing");
const loading = $derived(snapshot.status === "loading");
const modeLabels: Record<PlaybackMode, string> = {
	sequence: labels.modeSequence,
	"repeat-one": labels.modeRepeatOne,
	shuffle: labels.modeShuffle,
};
const modeIcons: Record<PlaybackMode, string> = {
	sequence: "material-symbols:repeat-rounded",
	"repeat-one": "material-symbols:repeat-one-rounded",
	shuffle: "material-symbols:shuffle-rounded",
};
const modeLabel = $derived(modeLabels[snapshot.mode]);
const modeIcon = $derived(modeIcons[snapshot.mode]);
const duration = $derived(Math.max(0, snapshot.duration));
const progressMax = $derived(duration > 0 ? duration : 1);
const progressRatio = $derived(
	duration > 0 ? Math.min(Math.max(snapshot.currentTime / duration, 0), 1) : 0,
);
const recentTracks = $derived.by(() =>
	recentIds.flatMap((id) => {
		const track = snapshot.playlist.find((item) => item.id === id);
		return track ? [track] : [];
	}),
);
const lyricsLines = $derived(
	(current?.lyrics ?? "")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean),
);
const liveMessage = $derived.by(() => {
	if (snapshot.error && snapshot.status === "error") {
		return labels.errors[snapshot.error];
	}
	if (playing && current)
		return labels.nowPlaying.replace("{title}", current.title);
	return "";
});

onMount(() => {
	let active = true;
	let unsubscribe = () => {};
	void import("@utils/music").then(
		({ getMusicRuntime, readRecentTrackIds }) => {
			if (!active) return;
			runtime = getMusicRuntime(options);
			unsubscribe = runtime.subscribe((next) => {
				snapshot = next;
			});
			recentIds = readRecentTrackIds();
		},
	);
	return () => {
		active = false;
		unsubscribe();
	};
});

$effect(() => {
	const track = snapshot.currentTrack;
	if (snapshot.status === "playing" && track && track.id !== recordedId) {
		recordedId = track.id;
		import("@utils/music").then(({ recordRecentTrack }) => {
			recentIds = recordRecentTrack(track.id);
		});
	}
});

function formatTime(value: number): string {
	if (!Number.isFinite(value) || value < 0) return "0:00";
	const seconds = Math.floor(value);
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function cycleMode(): void {
	const modes: PlaybackMode[] = ["sequence", "repeat-one", "shuffle"];
	runtime?.setMode(modes[(modes.indexOf(snapshot.mode) + 1) % modes.length]);
}

function onSeek(event: Event): void {
	const value = Number((event.currentTarget as HTMLInputElement).value);
	if (Number.isFinite(value)) runtime?.seek(Math.max(0, value));
}

function onVolume(event: Event): void {
	runtime?.setVolume(Number((event.currentTarget as HTMLInputElement).value));
}

function playIndex(index: number): void {
	void runtime?.select(index);
}

function selectRecent(id: string): void {
	const index = snapshot.playlist.findIndex((track) => track.id === id);
	if (index >= 0) void runtime?.select(index);
}
</script>

<section class="music-page" data-music-page aria-labelledby="music-page-title">
	<header class="music-page__hero">
		<p class="music-page__eyebrow">ALANKE AUDIO / LOCAL LIBRARY</p>
		<h1 id="music-page-title">{labels.library}</h1>
		<p class="music-page__subtitle">{subtitle}</p>
		{#if note}<p class="music-page__note">{note}</p>{/if}
	</header>

	<div class="music-page__grid">
		<article class="music-page__player" aria-label={labels.nowPlaying.replace("{title}", current?.title ?? "")}>
			<div class={`music-page__cover${playing ? " music-page__cover--playing" : ""}`}>
				{#if current?.cover}
					<img
						src={current.cover}
						srcset={current.coverSrcset}
						sizes="(max-width: 767px) 72vw, 360px"
						width={current.coverWidth}
						height={current.coverHeight}
						alt={`${current.title} cover`}
						loading="eager"
						decoding="async"
					/>
				{:else}
					<Icon icon="material-symbols:music-note-rounded" aria-hidden="true" />
				{/if}
				<span class="music-page__vinyl" aria-hidden="true"></span>
			</div>

			<div class="music-page__meta">
				<p class="music-page__now">{playing ? labels.nowPlaying.replace("{title}", current?.title ?? "") : (current?.title ?? labels.empty)}</p>
				<h2>{current?.title ?? labels.empty}</h2>
				<p>{current?.artist ?? "—"}{current?.album ? ` · ${current.album}` : ""}</p>
			</div>

			<div class="music-page__progress">
				<input
					type="range"
					min="0"
					max={progressMax}
					step="0.1"
					value={Math.min(snapshot.currentTime, progressMax)}
					disabled={duration <= 0 || !snapshot.playlist.length}
					aria-label={labels.progress
						.replace("{current}", formatTime(snapshot.currentTime))
						.replace("{duration}", formatTime(duration))}
					oninput={onSeek}
					style={`--music-progress: ${Math.round(progressRatio * 100)}%`}
				/>
				<div class="music-page__times">
					<span>{formatTime(snapshot.currentTime)}</span>
					<span>{formatTime(duration)}</span>
				</div>
			</div>

			<div class="music-page__controls">
				<IconButton
					icon={modeIcon}
					label={`${labels.playbackMode}: ${modeLabel}`}
					size="small"
					disabled={!snapshot.playlist.length}
					onclick={cycleMode}
				/>
				<IconButton
					icon="material-symbols:skip-previous-rounded"
					label={labels.previous}
					size="small"
					disabled={!snapshot.playlist.length}
					onclick={() => void runtime?.previous()}
				/>
				<IconButton
					icon="material-symbols:play-arrow-rounded"
					checkedIcon="material-symbols:pause-rounded"
					label={playing ? labels.pause : labels.play}
					variant="filled"
					size="medium"
					toggle
					checked={playing}
					disabled={!snapshot.playlist.length || loading}
					onclick={() => void runtime?.toggle()}
				/>
				<IconButton
					icon="material-symbols:skip-next-rounded"
					label={labels.next}
					size="small"
					disabled={!snapshot.playlist.length}
					onclick={() => void runtime?.next()}
				/>
				<div class="music-page__volume">
					<IconButton
						icon="material-symbols:volume-up-rounded"
						checkedIcon="material-symbols:volume-off-rounded"
						label={snapshot.muted ? labels.unmute : labels.mute}
						size="xsmall"
						toggle
						checked={snapshot.muted}
						onclick={() => runtime?.setMuted(!snapshot.muted)}
					/>
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={snapshot.volume}
						aria-label={labels.volume.replace("{volume}", String(Math.round(snapshot.volume * 100)))}
						oninput={onVolume}
						style={`--music-volume: ${Math.round(snapshot.volume * 100)}%`}
					/>
				</div>
			</div>

			{#if snapshot.error && snapshot.status === "error"}
				<p class="music-page__error" role="alert">{labels.errors[snapshot.error]}</p>
			{/if}

			<section class="music-page__lyrics" aria-labelledby="music-lyrics-title">
				<h3 id="music-lyrics-title">{labels.lyrics}</h3>
				{#if lyricsLines.length}
					<ol>
						{#each lyricsLines as line, index (index)}
							<li>{line}</li>
						{/each}
					</ol>
				{:else}
					<p class="music-page__placeholder">{labels.empty}</p>
				{/if}
			</section>

			<p class="sr-only" aria-live="polite" aria-atomic="true">{liveMessage}</p>
		</article>

		<div class="music-page__side">
			<section class="music-page__panel" aria-labelledby="music-recent-title">
				<header>
					<h2 id="music-recent-title">{labels.recentlyPlayed}</h2>
					<Icon icon="material-symbols:history-rounded" aria-hidden="true" />
				</header>
				{#if recentTracks.length}
					<ul class="music-page__list">
						{#each recentTracks as track (track.id)}
							<li>
								<button type="button" class="music-page__track" onclick={() => selectRecent(track.id)}>
									<span class="music-page__track-index" aria-hidden="true">
										<Icon icon="material-symbols:play-arrow-rounded" />
									</span>
									<span class="music-page__track-copy">
										<strong>{track.title}</strong>
										<span>{track.artist ?? "—"}</span>
									</span>
									<time>{formatTime(track.duration ?? 0)}</time>
								</button>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="music-page__placeholder">{labels.noRecent}</p>
				{/if}
			</section>

			<section class="music-page__panel" aria-labelledby="music-queue-title">
				<header>
					<h2 id="music-queue-title">{labels.queue}</h2>
					<span class="music-page__count">{snapshot.playlist.length}</span>
				</header>
				<ol class="music-page__list music-page__list--queue">
					{#each snapshot.playlist as track, index (track.id)}
						<li>
							<button
								type="button"
								class={`music-page__track${index === snapshot.currentIndex ? " music-page__track--current" : ""}`}
								aria-current={index === snapshot.currentIndex ? "true" : undefined}
								onclick={() => playIndex(index)}
							>
								<span class="music-page__track-index" aria-hidden="true">
									{#if index === snapshot.currentIndex && playing}
										<Icon icon="material-symbols:equalizer-rounded" />
									{:else}
										{index + 1}
									{/if}
								</span>
								<span class="music-page__track-copy">
									<strong>{track.title}</strong>
									<span>{track.artist ?? "—"}{track.album ? ` · ${track.album}` : ""}</span>
								</span>
								<time>{formatTime(track.duration ?? 0)}</time>
							</button>
						</li>
					{/each}
				</ol>
			</section>
		</div>
	</div>
</section>

<style lang="stylus">
.music-page
	display: flex
	flex-direction: column
	gap: var(--m3e-space-5)

	&__hero
		padding: 0.25rem 0.25rem 0
		h1
			margin: 0.35rem 0 0.5rem
			font: var(--m3e-type-display-small)
			letter-spacing: -0.035em
			color: var(--on-surface)

	&__eyebrow
		margin: 0
		color: var(--primary)
		font: var(--m3e-type-label-small)
		letter-spacing: 0.16em
		font-weight: 700

	&__subtitle
		margin: 0
		max-width: 46rem
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-large)

	&__note
		margin: 0.4rem 0 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-small)
		opacity: 0.8

	&__grid
		display: grid
		grid-template-columns: minmax(0, 1.15fr) minmax(18rem, 0.85fr)
		gap: var(--m3e-space-4)
		align-items: start
		@media (max-width: 1100px)
			grid-template-columns: minmax(0, 1fr)

	&__player,
	&__panel
		background: unquote("color-mix(in oklab, var(--card-bg) 78%, transparent)")
		border: 1px solid unquote("color-mix(in oklab, var(--outline-variant) 75%, transparent)")
		box-shadow: var(--m3e-elevation-1)
		backdrop-filter: blur(18px)
		-webkit-backdrop-filter: blur(18px)
		border-radius: var(--shape-corner-xl)

	&__player
		display: flex
		flex-direction: column
		gap: var(--m3e-space-4)
		padding: var(--m3e-space-5)
		@media (max-width: 640px)
			padding: var(--m3e-space-4)

	&__cover
		position: relative
		align-self: center
		width: unquote("min(100%, 22rem)")
		aspect-ratio: 1
		border-radius: var(--shape-corner-l)
		overflow: hidden
		background: var(--surface-container-high)
		img
			display: block
			width: 100%
			height: 100%
			object-fit: cover
		> :global(svg)
			width: 3rem
			height: 3rem
			margin: auto

	&__cover--playing &__vinyl
		opacity: 1

	&__vinyl
		position: absolute
		inset: 8%
		border-radius: 50%
		border: 1px solid rgba(255,255,255,0.35)
		opacity: 0
		transition: opacity var(--m3e-duration-long) var(--m3e-easing-standard)
		pointer-events: none
		&::after
			content: ""
			position: absolute
			inset: 44%
			border-radius: 50%
			background: rgba(255,255,255,0.7)

	&__meta
		text-align: center
		h2
			margin: 0.2rem 0
			font: var(--m3e-type-headline-small)
			color: var(--on-surface)
		p
			margin: 0
			color: var(--on-surface-variant)
			font: var(--m3e-type-body-medium)

	&__now
		color: var(--primary) !important
		font: var(--m3e-type-label-small) !important
		letter-spacing: 0.08em
		text-transform: uppercase

	&__progress
		display: flex
		flex-direction: column
		gap: 0.35rem
		input
			width: 100%
			accent-color: var(--primary)
			cursor: pointer

	&__times
		display: flex
		justify-content: space-between
		color: var(--on-surface-variant)
		font: var(--m3e-type-label-small)
		font-variant-numeric: tabular-nums

	&__controls
		display: flex
		flex-wrap: wrap
		align-items: center
		justify-content: center
		gap: var(--m3e-space-2)

	&__volume
		display: inline-flex
		align-items: center
		gap: 0.2rem
		margin-left: 0.25rem
		input
			width: 5.5rem
			accent-color: var(--primary)
			cursor: pointer
		@media (max-width: 420px)
			display: none

	&__error
		margin: 0
		padding: 0.6rem 0.8rem
		border-radius: var(--shape-corner-m)
		background: unquote("color-mix(in oklab, var(--error) 12%, transparent)")
		color: var(--error)
		font: var(--m3e-type-body-small)

	&__lyrics
		padding-top: var(--m3e-space-3)
		border-top: 1px solid var(--outline-variant)
		h3
			margin: 0 0 0.5rem
			font: var(--m3e-type-title-small)
			color: var(--on-surface)
		ol
			margin: 0
			padding: 0
			list-style: none
			color: var(--on-surface-variant)
			font: var(--m3e-type-body-small)
			line-height: 1.8
			max-height: 12rem
			overflow: auto

	&__side
		display: flex
		flex-direction: column
		gap: var(--m3e-space-4)

	&__panel
		padding: var(--m3e-space-4)
		header
			display: flex
			align-items: center
			justify-content: space-between
			gap: 0.75rem
			margin-bottom: 0.5rem
			h2
				margin: 0
				font: var(--m3e-type-title-medium)
				color: var(--on-surface)
			> :global(svg)
				width: 1.15rem
				height: 1.15rem
				color: var(--primary)

	&__count
		min-width: 1.5rem
		padding: 0.05rem 0.4rem
		border-radius: var(--shape-corner-full)
		background: var(--surface-container-high)
		color: var(--on-surface-variant)
		font: var(--m3e-type-label-small)
		text-align: center

	&__list
		margin: 0
		padding: 0
		list-style: none
		display: flex
		flex-direction: column
		gap: 0.15rem
		max-height: 20rem
		overflow: auto

	&__track
		display: flex
		align-items: center
		gap: 0.6rem
		width: 100%
		padding: 0.5rem 0.55rem
		border: 0
		border-radius: var(--shape-corner-m)
		background: transparent
		color: var(--on-surface)
		text-align: left
		cursor: pointer
		transition: background-color var(--m3e-duration-short) var(--m3e-easing-standard)
		&:hover,
		&:focus-visible
			background: unquote("color-mix(in oklab, var(--on-surface) 6%, transparent)")
		&:focus-visible
			outline: 2px solid var(--primary)
			outline-offset: -2px
		&--current
			background: unquote("color-mix(in oklab, var(--primary) 9%, transparent)")

	&__track-index
		display: inline-flex
		align-items: center
		justify-content: center
		width: 1.5rem
		flex-shrink: 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-label-small)
		font-variant-numeric: tabular-nums
		> :global(svg)
			width: 1rem
			height: 1rem

	&__track-copy
		display: flex
		flex-direction: column
		min-width: 0
		flex: 1
		strong
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap
			font: var(--m3e-type-label-large)
		span
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap
			color: var(--on-surface-variant)
			font: var(--m3e-type-label-small)

	&__track time
		flex-shrink: 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-label-small)
		font-variant-numeric: tabular-nums

	&__placeholder
		margin: 0
		padding: 0.6rem 0.2rem
		color: var(--on-surface-variant)
		font: var(--m3e-type-body-small)

	@media (prefers-reduced-motion: reduce)
		&__vinyl
			transition: none
</style>
