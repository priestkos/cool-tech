import { Bar, Stage, Text } from '@stageshow/kit'
import './stat.css'

export function StatStage() {
  return (
    <Stage width={280} height={200} className="st-stage">
      {() => (
        <div className="st-card">
          <Text className="st-label">Up to</Text>
          <Text className="st-value">2.1 s</Text>
          <Text className="st-caption">median checkout</Text>
          <Bar w={80} h={5} tone={3} className="st-bar" />
        </div>
      )}
    </Stage>
  )
}