import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatTime, PLAYBACK_RATES, type PlaybackRate } from "./shortcuts"

type MediaControlsProps = {
  playing: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playbackRate: PlaybackRate
  captionsOn: boolean
  pipSupported: boolean
  fullscreenEnabled: boolean
  onTogglePlay: () => void
  onSeek: (time: number) => void
  onVolume: (v: number) => void
  onToggleMute: () => void
  onRate: (r: PlaybackRate) => void
  onToggleCaptions: () => void
  onPip: () => void
  onFullscreen: () => void
  compact?: boolean
}

export function MediaControls({
  playing,
  currentTime,
  duration,
  volume,
  muted,
  playbackRate,
  captionsOn,
  pipSupported,
  fullscreenEnabled,
  onTogglePlay,
  onSeek,
  onVolume,
  onToggleMute,
  onRate,
  onToggleCaptions,
  onPip,
  onFullscreen,
  compact,
}: MediaControlsProps) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className={cn(
        "player-chrome flex flex-col gap-2 rounded-lg border border-border/80 bg-[var(--player-control-bg)] p-3 backdrop-blur-sm",
        compact && "p-2"
      )}
    >
      <label className="sr-only" htmlFor="seek-range">
        Seek
      </label>
      <input
        id="seek-range"
        type="range"
        min={0}
        max={duration || 100}
        step={0.1}
        value={currentTime}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer accent-[var(--player-accent)]"
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onTogglePlay}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "Pause" : "Play"}
        </Button>
        <span className="text-muted-foreground tabular-nums text-[0.65rem]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="xs"
            variant={muted ? "destructive" : "outline"}
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "Muted" : "Vol"}
          </Button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            className="h-1.5 w-16 accent-[var(--player-accent)] sm:w-20"
            aria-label="Volume"
          />
          <select
            className="h-6 rounded-md border border-border bg-input/40 px-1.5 text-[0.65rem]"
            value={playbackRate}
            onChange={(e) => onRate(Number(e.target.value) as PlaybackRate)}
            aria-label="Playback speed"
          >
            {PLAYBACK_RATES.map((r) => (
              <option key={r} value={r}>
                {r}×
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="xs"
            variant={captionsOn ? "default" : "outline"}
            onClick={onToggleCaptions}
            aria-pressed={captionsOn}
            aria-label="Captions"
          >
            CC
          </Button>
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={!pipSupported}
            onClick={onPip}
            aria-label="Picture in picture"
            title={pipSupported ? "Picture in picture" : "PiP not supported"}
          >
            PiP
          </Button>
          <Button
            type="button"
            size="xs"
            variant="outline"
            disabled={!fullscreenEnabled}
            onClick={onFullscreen}
            aria-label="Fullscreen"
          >
            FS
          </Button>
        </div>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-player-track"
        aria-hidden
      >
        <div
          className="h-full bg-player-accent transition-[width] duration-150"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}