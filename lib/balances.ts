import { roundMoney } from './format';
import type { Expense, Person, Settlement } from './types';

/** Positive = they owe you; negative = you owe them */
export type BalanceMap = Record<string, number>;

export function computePairBalances(
  youId: string,
  expenses: Expense[],
  settlements: Settlement[],
  personFilter?: string[] | null,
  groupId?: string | null,
) {
  const balances: BalanceMap = {};

  const inScopeExpense = (e: Expense) => {
    if (groupId !== undefined) {
      if (groupId === null) return e.groupId === null;
      return e.groupId === groupId;
    }
    if (personFilter) {
      const ids = new Set(e.splits.map((s) => s.personId).concat(e.paidById));
      return personFilter.every((id) => ids.has(id)) || personFilter.some((id) => ids.has(id));
    }
    return true;
  };

  const inScopeSettlement = (s: Settlement) => {
    if (groupId !== undefined) {
      if (groupId === null) return s.groupId === null;
      return s.groupId === groupId;
    }
    return true;
  };

  for (const expense of expenses.filter(inScopeExpense)) {
    for (const split of expense.splits) {
      if (split.personId === expense.paidById) continue;
      const amount = roundMoney(split.amount);

      if (expense.paidById === youId) {
        balances[split.personId] = roundMoney((balances[split.personId] ?? 0) + amount);
      } else if (split.personId === youId) {
        balances[expense.paidById] = roundMoney((balances[expense.paidById] ?? 0) - amount);
      }
    }
  }

  for (const settlement of settlements.filter(inScopeSettlement)) {
    if (settlement.fromId === youId) {
      balances[settlement.toId] = roundMoney((balances[settlement.toId] ?? 0) + settlement.amount);
    } else if (settlement.toId === youId) {
      balances[settlement.fromId] = roundMoney((balances[settlement.fromId] ?? 0) - settlement.amount);
    }
  }

  return balances;
}

export function summarizeBalances(balances: BalanceMap) {
  let youAreOwed = 0;
  let youOwe = 0;
  for (const value of Object.values(balances)) {
    if (value > 0.005) youAreOwed += value;
    else if (value < -0.005) youOwe += Math.abs(value);
  }
  return {
    youAreOwed: roundMoney(youAreOwed),
    youOwe: roundMoney(youOwe),
    net: roundMoney(youAreOwed - youOwe),
  };
}

export function simplifyDebts(balances: BalanceMap) {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  for (const [id, amount] of Object.entries(balances)) {
    if (amount > 0.005) creditors.push({ id, amount });
    else if (amount < -0.005) debtors.push({ id, amount: Math.abs(amount) });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: { fromId: string; toId: string; amount: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    transfers.push({
      fromId: debtors[i].id,
      toId: creditors[j].id,
      amount: roundMoney(pay),
    });
    debtors[i].amount = roundMoney(debtors[i].amount - pay);
    creditors[j].amount = roundMoney(creditors[j].amount - pay);
    if (debtors[i].amount < 0.005) i += 1;
    if (creditors[j].amount < 0.005) j += 1;
  }
  return transfers;
}

export function groupMemberBalances(
  memberIds: string[],
  expenses: Expense[],
  settlements: Settlement[],
  groupId: string,
) {
  const net: BalanceMap = Object.fromEntries(memberIds.map((id) => [id, 0]));

  for (const expense of expenses.filter((e) => e.groupId === groupId)) {
    for (const split of expense.splits) {
      if (split.personId === expense.paidById) continue;
      net[expense.paidById] = roundMoney((net[expense.paidById] ?? 0) + split.amount);
      net[split.personId] = roundMoney((net[split.personId] ?? 0) - split.amount);
    }
  }

  for (const settlement of settlements.filter((s) => s.groupId === groupId)) {
    net[settlement.fromId] = roundMoney((net[settlement.fromId] ?? 0) + settlement.amount);
    net[settlement.toId] = roundMoney((net[settlement.toId] ?? 0) - settlement.amount);
  }

  return net;
}

export function buildEqualSplits(total: number, personIds: string[]) {
  if (personIds.length === 0) return [];
  const base = Math.floor((total * 100) / personIds.length) / 100;
  const splits = personIds.map((personId) => ({ personId, amount: base }));
  const allocated = roundMoney(base * personIds.length);
  const remainder = roundMoney(total - allocated);
  if (splits.length && remainder !== 0) {
    splits[0].amount = roundMoney(splits[0].amount + remainder);
  }
  return splits;
}

export function peopleById(people: Person[]) {
  return Object.fromEntries(people.map((p) => [p.id, p])) as Record<string, Person>;
}
