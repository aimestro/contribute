export function formatMoney(amount: number, currency = 'USD') {
  const abs = Math.abs(amount);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(abs);
  } catch {
    return `$${abs.toFixed(2)}`;
  }
}

export function formatSignedMoney(amount: number, currency = 'USD') {
  if (Math.abs(amount) < 0.005) return formatMoney(0, currency);
  const prefix = amount > 0 ? '+' : '−';
  return `${prefix}${formatMoney(amount, currency)}`;
}

export function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}
