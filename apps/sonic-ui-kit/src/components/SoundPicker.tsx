import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SOUND_LIST, type ComponentSoundKey, type SoundId } from "@/lib/sound-registry"
import { useSoundContext } from "@/context/SoundProvider"

interface SoundPickerProps {
  componentKey: ComponentSoundKey
  label: string
}

export function SoundPicker({ componentKey, label }: SoundPickerProps) {
  const { settings, setComponentSound } = useSoundContext()
  const value = settings.componentSounds[componentKey]

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label} sound</Label>
      <Select
        value={value}
        onValueChange={(id) => setComponentSound(componentKey, id as SoundId)}
      >
        <SelectTrigger className="w-full max-w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SOUND_LIST.map((sound) => (
            <SelectItem key={sound.id} value={sound.id}>
              {sound.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
