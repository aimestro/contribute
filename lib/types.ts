export type SplitMethod = 'equal' | 'exact' | 'shares' | 'percent';

export type CategoryId =
  | 'general'
  | 'food'
  | 'travel'
  | 'home'
  | 'entertainment'
  | 'utilities'
  | 'groceries'
  | 'transport'
  | 'health'
  | 'other';

export type Person = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  isYou?: boolean;
};

export type Group = {
  id: string;
  name: string;
  emoji: string;
  memberIds: string[];
  createdAt: string;
};

export type ExpenseSplit = {
  personId: string;
  amount: number;
  shares?: number;
  percent?: number;
};

export type Expense = {
  id: string;
  groupId: string | null;
  description: string;
  amount: number;
  currency: string;
  category: CategoryId;
  paidById: string;
  splits: ExpenseSplit[];
  splitMethod: SplitMethod;
  note?: string;
  createdAt: string;
};

export type Settlement = {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  groupId: string | null;
  note?: string;
  createdAt: string;
};

export type ActivityItem =
  | { type: 'expense'; at: string; expense: Expense }
  | { type: 'settlement'; at: string; settlement: Settlement }
  | { type: 'group'; at: string; group: Group };

export type AppState = {
  people: Person[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
  hydrated: boolean;
};
