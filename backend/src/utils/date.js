export function resolveExpiry(input) {
  const now = Date.now();

  if (!input) {
    return new Date(now + 10 * 60 * 1000);
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime()) || date.getTime() <= now) {
    return null;
  }

  return date;
}
