import { Button } from '@/components/ui/button'
import { SoundSelect } from '@/components/sound-select'
import { useSoundKit } from '@/context/sound-provider'
import type { SoundId } from '@/lib/sound-catalog'
import { toast } from 'sonner'

const kinds: { key: 'success' | 'error' | 'info'; label: string; message: string }[] =
  [
    {
      key: 'success',
      label: 'Success',
      message: 'Profile saved — Sound Lab bloom confirms it.',
    },
    {
      key: 'error',
      label: 'Error',
      message: 'Could not sync — shake hints something went wrong.',
    },
    {
      key: 'info',
      label: 'Info',
      message: 'Tip: sounds are recipes, not audio files.',
    },
  ]

export function NotificationScene() {
  const { settings, setToastSound, playById } = useSoundKit()

  const fire = (kind: 'success' | 'error' | 'info') => {
    const soundId = settings.toastSounds[kind]
    playById(soundId)
    const copy = kinds.find(k => k.key === kind)!
    if (kind === 'success') toast.success(copy.label, { description: copy.message })
    if (kind === 'error') toast.error(copy.label, { description: copy.message })
    if (kind === 'info') toast.info(copy.label, { description: copy.message })
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-left text-sm text-muted-foreground">
        Notification center: each toast type plays its own installed Sound Lab recipe.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {kinds.map(kind => (
          <article
            key={kind.key}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-left"
          >
            <SoundSelect
              label={`${kind.label} sound`}
              value={settings.toastSounds[kind.key]}
              onValueChange={(id: SoundId) => setToastSound(kind.key, id)}
            />
            <Button type="button" onClick={() => fire(kind.key)}>
              Send {kind.label.toLowerCase()}
            </Button>
          </article>
        ))}
      </div>
    </div>
  )
}
