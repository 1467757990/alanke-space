<script lang="ts">
/**
 * 全站迷你播放器（固定悬浮，位于 Swup 容器之外）。
 * 与 /music/ 页共用 getMusicRuntime() 单例，因此页面切换不会产生第二个 Audio，
 * 也不会因组件卸载而中断播放。只有用户点击播放时才创建音频源。
 */
import IconButton from "@components/atoms/action/IconButton.svelte";
import Icon from "@iconify/svelte";
import type { MusicLabels } from "@utils/music/labels";
import { url } from "@utils/url-utils";
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
}

let { options, labels }: Props = $props();
const first = options.playlist[0] ?? null;
let runtime = $state<MusicRuntime | null>(null);
let snapshot = $state<MusicSnapshot>({
	playlist: options.playlist,
	currentIndex: first ? 0 : -1,
	currentTrack: first,
	status: "idle",
	currentTime: 0,
	duration: first?.duration ?? 0,
	volume: options.defaultVolume,
	muted: false,
	mode: options.defaultMode,
	error: first ? null : "empty-playlist",
});
let expanded = $state(false);
let recordedId = "";

const current = $derived(snapshot.currentTrack);
const playing = $derived(snapshot.status === "playing");
const loading = $derived(snapshot.status === "loading");
const hasTracks = $derived(snapshot.playlist.length > 0);
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
const duration = $derived(Math.max(0, snapshot.duration));
const progressMax = $derived(duration > 0 ? duration : 1);
const progressRatio = $derived(
	duration > 0 ? Math.min(Math.max(snapshot.currentTime / duration, 0), 1) : 0,
);
const title = $derived(
	current?.title ?? (loading ? labels.loading : labels.empty),
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
	void import("@utils/music").then(({ getMusicRuntime }) => {
		if (!active) return;
		runtime = getMusicRuntime(options);
		unsubscribe = runtime.subscribe((next) => {
			snapshot = next;
		});
	});
	return () => {
		active = false;
		unsubscribe();
	};
});

$effect(() => {
	const track = snapshot.currentTrack;
	if (snapshot.status === "playing" && track && track.id !== recordedId) {
		recordedId = track.id;
		import("@utils/music").then(({ recordRecentTrack }) =>
			recordRecentTrack(track.id),
		);
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
</script>

<svelte:window onkeydown={(event) => {
	if (event.key === "Escape") expanded = false;
}} />

<div
	class="global-music-dock"
	class:global-music-dock--expanded={expanded}
	data-music-dock
	aria-label={labels.library}
>
	{#if expanded}
		<div class="global-music-dock__panel">
			<div class="global-music-dock__panel-head">
				<div>
					<strong>{current?.title ?? labels.empty}</strong>
					<span>{current?.artist ?? "—"}{current?.album ? ` · ${current.album}` : ""}</span>
				</div>
				<a href={url("/music/")} class="global-music-dock__open">
					{labels.library}
					<Icon icon="material-symbols:arrow-outward-rounded" aria-hidden="true" />
				</a>
			</div>

			<div class="global-music-dock__progress">
				<input
					type="range"
					min="0"
					max={progressMax}
					step="0.1"
					value={Math.min(snapshot.currentTime, progressMax)}
					disabled={duration <= 0 || !hasTracks}
					aria-label={labels.progress
						.replace("{current}", formatTime(snapshot.currentTime))
						.replace("{duration}", formatTime(duration))}
					oninput={onSeek}
				/>
				<div class="global-music-dock__times">
					<span>{formatTime(snapshot.currentTime)}</span>
					<span>{formatTime(duration)}</span>
				</div>
			</div>

			<div class="global-music-dock__controls">
				<IconButton
					icon={modeIcons[snapshot.mode]}
					label={`${labels.playbackMode}: ${modeLabel}`}
					size="xsmall"
					disabled={!hasTracks}
					onclick={cycleMode}
				/>
				<IconButton
					icon="material-symbols:skip-previous-rounded"
					label={labels.previous}
					size="small"
					disabled={!hasTracks}
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
					disabled={!hasTracks || loading}
					onclick={() => void runtime?.toggle()}
				/>
				<IconButton
					icon="material-symbols:skip-next-rounded"
					label={labels.next}
					size="small"
					disabled={!hasTracks}
					onclick={() => void runtime?.next()}
				/>
				<div class="global-music-dock__volume">
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
					/>
				</div>
			</div>

			{#if snapshot.error && snapshot.status === "error"}
				<p class="global-music-dock__error" role="alert">{labels.errors[snapshot.error]}</p>
			{/if}

			<ol class="global-music-dock__playlist">
				{#each snapshot.playlist as track, index (track.id)}
					<li>
						<button
							type="button"
							class={`global-music-dock__track${index === snapshot.currentIndex ? " global-music-dock__track--current" : ""}`}
							aria-current={index === snapshot.currentIndex ? "true" : undefined}
							onclick={() => void runtime?.select(index)}
						>
							<span class="global-music-dock__index" aria-hidden="true">
								{#if index === snapshot.currentIndex && playing}
									<Icon icon="material-symbols:equalizer-rounded" />
								{:else}
									{index + 1}
								{/if}
							</span>
							<span class="global-music-dock__copy">
								<strong>{track.title}</strong>
								<span>{track.artist ?? "—"}</span>
							</span>
							<time>{formatTime(track.duration ?? 0)}</time>
						</button>
					</li>
				{/each}
			</ol>
		</div>
	{/if}

	<div class="global-music-dock__bar">
		<button
			type="button"
			class="global-music-dock__cover"
			aria-label={title}
			onclick={() => (expanded = !expanded)}
			aria-expanded={expanded}
		>
			{#if current?.cover}
				<img
					src={current.cover}
					srcset={current.coverSrcset}
					sizes="48px"
					width={current.coverWidth}
					height={current.coverHeight}
					alt=""
					loading="lazy"
					decoding="async"
				/>
			{:else}
				<Icon icon="material-symbols:music-note-rounded" aria-hidden="true" />
			{/if}
		</button>

		<a class="global-music-dock__meta" href={url("/music/")}>
			<strong>{title}</strong>
			<span>{current?.artist ?? labels.library}</span>
		</a>

		<div class="global-music-dock__mini-controls">
			<IconButton
				icon="material-symbols:skip-previous-rounded"
				label={labels.previous}
				size="xsmall"
				disabled={!hasTracks}
				onclick={() => void runtime?.previous()}
			/>
			<IconButton
				icon="material-symbols:play-arrow-rounded"
				checkedIcon="material-symbols:pause-rounded"
				label={playing ? labels.pause : labels.play}
				variant="filled"
				size="small"
				toggle
				checked={playing}
				disabled={!hasTracks || loading}
				onclick={() => void runtime?.toggle()}
			/>
			<IconButton
				icon="material-symbols:skip-next-rounded"
				label={labels.next}
				size="xsmall"
				disabled={!hasTracks}
				onclick={() => void runtime?.next()}
			/>
		</div>

		<IconButton
			icon="material-symbols:keyboard-arrow-up-rounded"
			label={expanded ? labels.hidePlaylist : labels.showPlaylist}
			size="xsmall"
			ariaExpanded={expanded}
			onclick={() => (expanded = !expanded)}
			class="global-music-dock__toggle"
		/>
	</div>

	<div class="global-music-dock__progress-line" aria-hidden="true">
		<span style={`width: ${progressRatio * 100}%`}></span>
	</div>

	<p class="sr-only" aria-live="polite" aria-atomic="true">{liveMessage}</p>
</div>

<style lang="stylus">
.global-music-dock
	position: fixed
	left: 50%
	bottom: calc(1rem + env(safe-area-inset-bottom))
	z-index: 45
	width: unquote("min(31rem, calc(100vw - 2rem))")
	transform: translateX(-50%)
	border-radius: var(--shape-corner-xl)
	border: 1px solid unquote("color-mix(in oklab, var(--outline-variant) 72%, transparent)")
	background: unquote("color-mix(in oklab, var(--surface-container-low) 78%, transparent)")
	box-shadow: var(--m3e-elevation-3)
	backdrop-filter: blur(22px) saturate(1.3)
	-webkit-backdrop-filter: blur(22px) saturate(1.3)
	overflow: hidden
	color: var(--on-surface)
	transition:
		width var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate),
		border-radius var(--m3e-duration-medium) var(--m3e-easing-standard)

	@media (max-width: 767px)
		bottom: calc(5.5rem + env(safe-area-inset-bottom))
		width: calc(100vw - 1rem)

	&--expanded
		@media (min-width: 768px)
			width: unquote("min(38rem, calc(100vw - 2rem))")

	&__bar
		display: flex
		align-items: center
		gap: 0.55rem
		padding: 0.45rem 0.55rem

	&__cover
		display: flex
		align-items: center
		justify-content: center
		width: 2.9rem
		height: 2.9rem
		flex-shrink: 0
		padding: 0
		border: 0
		border-radius: var(--shape-corner-m)
		overflow: hidden
		background: var(--surface-container-high)
		cursor: pointer
		img
			width: 100%
			height: 100%
			object-fit: cover
		> :global(svg)
			width: 1.3rem
			height: 1.3rem
			color: var(--primary)

	&__meta
		display: flex
		flex-direction: column
		flex: 1
		min-width: 0
		text-decoration: none
		color: var(--on-surface)
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

	&__mini-controls
		display: flex
		align-items: center
		gap: 0.05rem

	&__toggle
		@media (max-width: 360px)
			display: none

	&__progress-line
		height: 2px
		background: unquote("color-mix(in oklab, var(--outline-variant) 60%, transparent)")
		span
			display: block
			height: 100%
			background: var(--primary)
			transition: width 0.2s linear

	&__panel
		display: flex
		flex-direction: column
		gap: 0.65rem
		padding: 0.85rem 0.9rem 0.55rem
		border-bottom: 1px solid unquote("color-mix(in oklab, var(--outline-variant) 55%, transparent)")
		max-height: unquote("min(65vh, 34rem)")
		overflow: auto

	&__panel-head
		display: flex
		justify-content: space-between
		gap: 1rem
		> div
			display: flex
			flex-direction: column
			min-width: 0
		strong
			font: var(--m3e-type-title-small)
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap
		span
			color: var(--on-surface-variant)
			font: var(--m3e-type-label-small)

	&__open
		display: inline-flex
		align-items: center
		gap: 0.2rem
		flex-shrink: 0
		color: var(--primary)
		font: var(--m3e-type-label-small)
		text-decoration: none
		> :global(svg)
			width: 0.9rem
			height: 0.9rem

	&__progress
		display: flex
		flex-direction: column
		gap: 0.1rem
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
		align-items: center
		justify-content: center
		gap: 0.2rem

	&__volume
		display: inline-flex
		align-items: center
		gap: 0.1rem
		margin-left: 0.35rem
		input
			width: 4.5rem
			accent-color: var(--primary)
			cursor: pointer
		@media (max-width: 480px)
			display: none

	&__error
		margin: 0
		color: var(--error)
		font: var(--m3e-type-body-small)

	&__playlist
		display: flex
		flex-direction: column
		gap: 0.1rem
		margin: 0
		padding: 0
		list-style: none

	&__track
		display: flex
		align-items: center
		gap: 0.55rem
		width: 100%
		padding: 0.4rem 0.5rem
		border: 0
		border-radius: var(--shape-corner-m)
		background: transparent
		color: var(--on-surface)
		text-align: left
		cursor: pointer
		&:hover,
		&:focus-visible
			background: unquote("color-mix(in oklab, var(--on-surface) 6%, transparent)")
		&:focus-visible
			outline: 2px solid var(--primary)
			outline-offset: -2px
		&--current
			background: unquote("color-mix(in oklab, var(--primary) 9%, transparent)")

	&__index
		display: inline-flex
		align-items: center
		justify-content: center
		width: 1.2rem
		flex-shrink: 0
		color: var(--on-surface-variant)
		font: var(--m3e-type-label-small)
		> :global(svg)
			width: 0.9rem
			height: 0.9rem

	&__copy
		display: flex
		flex-direction: column
		flex: 1
		min-width: 0
		strong
			overflow: hidden
			text-overflow: ellipsis
			white-space: nowrap
			font: var(--m3e-type-label-medium)
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

:global(body:has([data-music-page])) .global-music-dock
	display: none

@media (prefers-reduced-motion: reduce)
	.global-music-dock
		transition: none
	.global-music-dock__progress-line span
		transition: none
</style>
