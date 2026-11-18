import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import type { MusicErrorCode, PlaybackMode } from "@/types/musicConfig";

export interface MusicLabels {
	previous: string;
	play: string;
	pause: string;
	next: string;
	mute: string;
	unmute: string;
	playbackMode: string;
	modeSequence: string;
	modeRepeatOne: string;
	modeShuffle: string;
	progress: string;
	volume: string;
	showPlaylist: string;
	hidePlaylist: string;
	empty: string;
	loading: string;
	notRequested: string;
	nowPlaying: string;
	library: string;
	recentlyPlayed: string;
	queue: string;
	lyrics: string;
	noRecent: string;
	openMusic: string;
	errors: Record<MusicErrorCode, string>;
}

export const PLAYBACK_MODE_LABELS: Record<PlaybackMode, keyof MusicLabels> = {
	sequence: "modeSequence",
	"repeat-one": "modeRepeatOne",
	shuffle: "modeShuffle",
};

export const PLAYBACK_MODE_ICONS: Record<PlaybackMode, string> = {
	sequence: "material-symbols:repeat-rounded",
	"repeat-one": "material-symbols:repeat-one-rounded",
	shuffle: "material-symbols:shuffle-rounded",
};

export function getMusicLabels(): MusicLabels {
	return {
		previous: i18n(I18nKey.musicPrevious),
		play: i18n(I18nKey.musicPlay),
		pause: i18n(I18nKey.musicPause),
		next: i18n(I18nKey.musicNext),
		mute: i18n(I18nKey.musicMute),
		unmute: i18n(I18nKey.musicUnmute),
		playbackMode: i18n(I18nKey.musicPlaybackMode),
		modeSequence: i18n(I18nKey.musicModeSequence),
		modeRepeatOne: i18n(I18nKey.musicModeRepeatOne),
		modeShuffle: i18n(I18nKey.musicModeShuffle),
		progress: i18n(I18nKey.musicProgress),
		volume: i18n(I18nKey.musicVolume),
		showPlaylist: i18n(I18nKey.musicShowPlaylist),
		hidePlaylist: i18n(I18nKey.musicHidePlaylist),
		empty: i18n(I18nKey.musicEmpty),
		loading: i18n(I18nKey.musicLoading),
		notRequested: i18n(I18nKey.musicNotRequested),
		nowPlaying: i18n(I18nKey.musicNowPlaying),
		library: i18n(I18nKey.musicLibrary),
		recentlyPlayed: i18n(I18nKey.musicRecentlyPlayed),
		queue: i18n(I18nKey.musicQueueTitle),
		lyrics: i18n(I18nKey.musicLyricsTitle),
		noRecent: i18n(I18nKey.musicNoRecent),
		openMusic: i18n(I18nKey.music),
		errors: {
			"empty-playlist": i18n(I18nKey.musicErrorEmptyPlaylist),
			"source-unavailable": i18n(I18nKey.musicErrorSourceUnavailable),
			"autoplay-blocked": i18n(I18nKey.musicErrorAutoplayBlocked),
			"invalid-track": i18n(I18nKey.musicErrorInvalidTrack),
		},
	};
}
