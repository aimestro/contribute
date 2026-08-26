import type { CategoryId } from './types';

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
}[] = [
  { id: 'general', label: 'General', emoji: '◎', color: '#0B6E4F' },
  { id: 'food', label: 'Food & drink', emoji: '◌', color: '#E07A3D' },
  { id: 'groceries', label: 'Groceries', emoji: '◍', color: '#2A9D8F' },
  { id: 'travel', label: 'Travel', emoji: '◇', color: '#264653' },
  { id: 'transport', label: 'Transport', emoji: '△', color: '#457B9D' },
  { id: 'home', label: 'Home', emoji: '□', color: '#6D597A' },
  { id: 'utilities', label: 'Utilities', emoji: '⚡', color: '#BC6C25' },
  { id: 'entertainment', label: 'Fun', emoji: '☆', color: '#E9C46A' },
  { id: 'health', label: 'Health', emoji: '+', color: '#E76F51' },
  { id: 'other', label: 'Other', emoji: '·', color: '#5C6B64' },
];

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}
