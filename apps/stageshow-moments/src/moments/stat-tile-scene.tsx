import { Zap } from 'lucide-react'

export function StatTileScene() {
  return (
    <div className="stat-tile">
      <p className="stat-lead">Up to</p>
      <p className="stat-number">
        2.1<span className="stat-unit"> s</span>
      </p>
      <p className="stat-label">
        <Zap size={14} className="stat-icon" aria-hidden />
        median checkout
      </p>
    </div>
  )
}
