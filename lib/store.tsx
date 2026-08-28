import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import { buildSplits } from './balances';
import { uid } from './format';
import { SEED, YOU_ID } from './seed';
import type {
  AppState,
  CategoryId,
  Expense,
  Group,
  Person,
  Settlement,
  SplitMethod,
} from './types';

const STORAGE_KEY = 'contribute.v1';

type Action =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'RESET_DEMO' }
  | { type: 'ADD_PERSON'; person: Person }
  | { type: 'ADD_GROUP'; group: Group }
  | { type: 'ADD_EXPENSE'; expense: Expense }
  | { type: 'UPDATE_EXPENSE'; expense: Expense }
  | { type: 'DELETE_EXPENSE'; id: string }
  | { type: 'ADD_SETTLEMENT'; settlement: Settlement }
  | { type: 'REPLACE_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'RESET_DEMO':
      return { ...SEED, hydrated: true };
    case 'ADD_PERSON':
      return { ...state, people: [...state.people, action.person] };
    case 'ADD_GROUP':
      return { ...state, groups: [action.group, ...state.groups] };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.expense, ...state.expenses] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.expense.id ? action.expense : e,
        ),
      };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
    case 'ADD_SETTLEMENT':
      return { ...state, settlements: [action.settlement, ...state.settlements] };
    case 'REPLACE_STATE':
      return { ...action.payload, hydrated: true };
    default:
      return state;
  }
}

type StoreApi = {
  state: AppState;
  you: Person;
  addFriend: (name: string, email?: string) => Person;
  addGroup: (name: string, emoji: string, memberIds: string[]) => Group;
  addExpense: (input: {
    description: string;
    amount: number;
    category: CategoryId;
    paidById: string;
    participantIds: string[];
    groupId: string | null;
    splitMethod?: SplitMethod;
    splits?: { personId: string; amount: number }[];
    note?: string;
  }) => Expense;
  settleUp: (input: {
    fromId: string;
    toId: string;
    amount: number;
    groupId?: string | null;
    note?: string;
  }) => Settlement;
  deleteExpense: (id: string) => void;
  resetDemo: () => void;
  replaceState: (newState: AppState) => void;
};

const StoreContext = createContext<StoreApi | null>(null);

const AVATAR_COLORS = ['#E07A3D', '#457B9D', '#6D597A', '#BC6C25', '#2A9D8F', '#C4492D'];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...SEED, hydrated: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Omit<AppState, 'hydrated'>;
          dispatch({
            type: 'HYDRATE',
            payload: { ...parsed, hydrated: true },
          });
        } else {
          dispatch({ type: 'HYDRATE', payload: { ...SEED, hydrated: true } });
        }
      } catch {
        dispatch({ type: 'HYDRATE', payload: { ...SEED, hydrated: true } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, ...persistable } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable)).catch(() => {});
  }, [state]);

  const you = useMemo(
    () => state.people.find((p) => p.isYou) ?? state.people[0],
    [state.people],
  );

  const addFriend = useCallback(
    (name: string, email = '') => {
      const person: Person = {
        id: uid('p'),
        name: name.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`,
        avatarColor: AVATAR_COLORS[state.people.length % AVATAR_COLORS.length],
      };
      dispatch({ type: 'ADD_PERSON', person });
      return person;
    },
    [state.people.length],
  );

  const addGroup = useCallback((name: string, emoji: string, memberIds: string[]) => {
    const group: Group = {
      id: uid('g'),
      name: name.trim(),
      emoji: emoji || '◎',
      memberIds: Array.from(new Set([YOU_ID, ...memberIds])),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_GROUP', group });
    return group;
  }, []);

  const addExpense = useCallback(
    (input: {
      description: string;
      amount: number;
      category: CategoryId;
      paidById: string;
      participantIds: string[];
      groupId: string | null;
      splitMethod?: SplitMethod;
      splits?: { personId: string; amount: number }[];
      note?: string;
    }) => {
      const splits =
        input.splits ?? buildSplits(input.splitMethod ?? 'equal', input.amount,
        input.participantIds.map((id) => ({ personId: id })));
      const expense: Expense = {
        id: uid('e'),
        description: input.description.trim(),
        amount: input.amount,
        currency: 'USD',
        category: input.category,
        paidById: input.paidById,
        splits,
        splitMethod: input.splitMethod ?? 'equal',
        groupId: input.groupId,
        note: input.note,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_EXPENSE', expense });
      return expense;
    },
    [],
  );

  const settleUp = useCallback(
    (input: {
      fromId: string;
      toId: string;
      amount: number;
      groupId?: string | null;
      note?: string;
    }) => {
      const settlement: Settlement = {
        id: uid('s'),
        fromId: input.fromId,
        toId: input.toId,
        amount: input.amount,
        groupId: input.groupId ?? null,
        note: input.note,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_SETTLEMENT', settlement });
      return settlement;
    },
    [],
  );

  const deleteExpense = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', id });
  }, []);

  const resetDemo = useCallback(() => {
    dispatch({ type: 'RESET_DEMO' });
  }, []);

  const replaceState = useCallback((newState: AppState) => {
    dispatch({ type: 'REPLACE_STATE', payload: newState });
  }, []);

  const value = useMemo(
    () => ({
      state,
      you,
      addFriend,
      addGroup,
      addExpense,
      settleUp,
      deleteExpense,
      resetDemo,
      replaceState,
    }),
    [state, you, addFriend, addGroup, addExpense, settleUp, deleteExpense, resetDemo, replaceState],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
