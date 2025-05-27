export function isOlderThan24Hours(date: string | Date) {
  const last = new Date(date);
  const now = new Date();
  const diff = now.getTime() - last.getTime();
  return diff > 24 * 60 * 60 * 1000;
}

export function countRefreshesToday(timestamps: string[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return timestamps.filter(ts => ts.startsWith(today)).length;
}
