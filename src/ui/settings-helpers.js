// Shared helpers for settings UI

export function formatSeconds(totalSeconds) {
  const n = Math.max(0, Number(totalSeconds) || 0);
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
