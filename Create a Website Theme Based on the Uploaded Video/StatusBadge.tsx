import { titleCase } from '../../utils/formatters'
type StatusTone = 'healthy' | 'moderate' | 'attention' | 'critical'
export function StatusBadge({ value, tone = 'moderate' }: { value: string; tone?: StatusTone }) {
  return <span className={`status-badge ${tone}`} aria-label={`Status: ${titleCase(value)}`}>{titleCase(value)}</span>
}
