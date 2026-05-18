import { formatDistanceToNowStrict } from 'date-fns';

export function timeAgo(date) {
  if (!date) return 'never';
  return `${formatDistanceToNowStrict(new Date(date))} ago`;
}

export function verdictText(verdict) {
  if (verdict === 'TAKEN') return 'Taken';
  if (verdict === 'LIKELY_TAKEN') return 'Likely Taken';
  return 'Available';
}

export function verdictTone(verdict) {
  if (verdict === 'TAKEN') return 'danger';
  if (verdict === 'LIKELY_TAKEN') return 'warning';
  return 'available';
}
