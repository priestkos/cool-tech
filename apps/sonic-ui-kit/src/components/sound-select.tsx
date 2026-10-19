import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SOUND_CATALOG, type SoundId } from '@/lib/sound-catalog'

type SoundSelectProps = {
  value: SoundId
  onValueChange: (value: SoundId) => void
  label: string
}

export function SoundSelect({ value, onValueChange, label }: SoundSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={v => onValueChange(v as SoundId)}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(SOUND_CATALOG).map(([id, meta]) => (
            <SelectItem key={id} value={id}>
              {meta.label} — {meta.description}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
