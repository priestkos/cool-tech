import type { ReactNode } from 'react'

import {
  ChannelStrip,
  ChannelStripControls,
  ChannelStripFader,
  ChannelStripHeader,
  ChannelStripMeter,
  ChannelStripNotice,
  ChannelStripTitle,
  ChannelStripValue,
} from '@/components/ui/channel-strip'
import {
  MonitorToggle,
  MuteToggle,
  SoloToggle,
} from '@/components/ui/channel-toggle'
import { DbReadout } from '@/components/ui/db-readout'
import {
  Fader,
  FaderRange,
  FaderThumb,
  FaderTrack,
} from '@/components/ui/fader'
import { LevelMeter } from '@/components/ui/level-meter'
import { PanControl } from '@/components/ui/pan-control'
import type { Mixer } from '@/hooks/use-mixer'
import type { FrameSource, MeterFrame } from '@/lib/audio/types'

export interface ChannelStripRowProps {
  id: string
  title: string
  mixer: Mixer
  meter: FrameSource<MeterFrame>
  headerExtra?: ReactNode
  notice?: ReactNode
  showMonitor?: boolean
  disabled?: boolean
}

export function ChannelStripRow({
  id,
  title,
  mixer,
  meter,
  headerExtra,
  notice,
  showMonitor = true,
  disabled = false,
}: ChannelStripRowProps) {
  const channel = mixer.channel(id)
  if (!channel) {
    return null
  }

  return (
    <ChannelStrip
      dimmed={mixer.isDimmed(id)}
      disabled={disabled}
      muted={channel.muted}
      solo={channel.solo}
    >
      <ChannelStripHeader>
        <ChannelStripTitle>{title}</ChannelStripTitle>
        {headerExtra}
      </ChannelStripHeader>
      <ChannelStripMeter>
        <LevelMeter
          aria-label={`${title} level`}
          channelCount={2}
          className="h-24 w-full min-w-[6rem]"
          size="sm"
          source={meter}
        />
      </ChannelStripMeter>
      <ChannelStripFader>
        <Fader
          aria-label={`${title} volume`}
          max={12}
          min={-60}
          onValueChange={(gainDb) => mixer.setGain(id, gainDb)}
          orientation="vertical"
          silenceAtMin
          size="sm"
          taper="audio"
          value={channel.gainDb}
        >
          <FaderTrack>
            <FaderRange />
            <FaderThumb />
          </FaderTrack>
        </Fader>
      </ChannelStripFader>
      <ChannelStripValue>
        <DbReadout
          aria-label={`${title} level readout`}
          floorDb={-60}
          value={channel.gainDb}
        />
      </ChannelStripValue>
      <ChannelStripControls className="flex flex-col items-center gap-1">
        <PanControl
          aria-label={`${title} pan`}
          onValueChange={(pan) => mixer.setPan(id, pan)}
          size="sm"
          value={channel.pan}
        />
        <MuteToggle
          aria-label={`Mute ${title}`}
          onPressedChange={(muted) => mixer.setMuted(id, muted)}
          pressed={channel.muted}
          size="sm"
        >
          M
        </MuteToggle>
        <SoloToggle
          aria-label={`Solo ${title}`}
          onPressedChange={(solo) => mixer.setSolo(id, solo)}
          pressed={channel.solo}
          size="sm"
        >
          S
        </SoloToggle>
        {showMonitor ? (
          <MonitorToggle
            aria-label={`Monitor ${title}`}
            onPressedChange={(monitor) => mixer.setMonitor(id, monitor)}
            pressed={channel.monitor}
            size="sm"
          />
        ) : null}
      </ChannelStripControls>
      {notice ? <ChannelStripNotice>{notice}</ChannelStripNotice> : null}
    </ChannelStrip>
  )
}
