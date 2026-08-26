import type { AppState } from './types';

const YOU = 'p_you';
const AVA = 'p_ava';
const NOAH = 'p_noah';
const MIA = 'p_mia';
const LEO = 'p_leo';

export const SEED: Omit<AppState, 'hydrated'> = {
  people: [
    {
      id: YOU,
      name: 'You',
      email: 'you@contribute.app',
      avatarColor: '#0B6E4F',
      isYou: true,
    },
    {
      id: AVA,
      name: 'Ava Chen',
      email: 'ava@example.com',
      avatarColor: '#E07A3D',
    },
    {
      id: NOAH,
      name: 'Noah Patel',
      email: 'noah@example.com',
      avatarColor: '#457B9D',
    },
    {
      id: MIA,
      name: 'Mia Rossi',
      email: 'mia@example.com',
      avatarColor: '#6D597A',
    },
    {
      id: LEO,
      name: 'Leo Kim',
      email: 'leo@example.com',
      avatarColor: '#BC6C25',
    },
  ],
  groups: [
    {
      id: 'g_apartment',
      name: 'Apartment 4B',
      emoji: '⌂',
      memberIds: [YOU, AVA, NOAH],
      createdAt: '2026-07-01T10:00:00.000Z',
    },
    {
      id: 'g_trip',
      name: 'Coast Trip',
      emoji: '≈',
      memberIds: [YOU, AVA, MIA, LEO],
      createdAt: '2026-08-10T12:00:00.000Z',
    },
    {
      id: 'g_dinner',
      name: 'Friday dinners',
      emoji: '◎',
      memberIds: [YOU, NOAH, MIA],
      createdAt: '2026-08-01T18:00:00.000Z',
    },
  ],
  expenses: [
    {
      id: 'e1',
      groupId: 'g_apartment',
      description: 'August rent',
      amount: 2400,
      currency: 'USD',
      category: 'home',
      paidById: YOU,
      splitMethod: 'equal',
      splits: [
        { personId: YOU, amount: 800 },
        { personId: AVA, amount: 800 },
        { personId: NOAH, amount: 800 },
      ],
      createdAt: '2026-08-02T09:00:00.000Z',
    },
    {
      id: 'e2',
      groupId: 'g_apartment',
      description: 'Internet + power',
      amount: 168.5,
      currency: 'USD',
      category: 'utilities',
      paidById: AVA,
      splitMethod: 'equal',
      splits: [
        { personId: YOU, amount: 56.17 },
        { personId: AVA, amount: 56.17 },
        { personId: NOAH, amount: 56.16 },
      ],
      createdAt: '2026-08-05T14:20:00.000Z',
    },
    {
      id: 'e3',
      groupId: 'g_trip',
      description: 'Airbnb coastal cabin',
      amount: 920,
      currency: 'USD',
      category: 'travel',
      paidById: MIA,
      splitMethod: 'equal',
      splits: [
        { personId: YOU, amount: 230 },
        { personId: AVA, amount: 230 },
        { personId: MIA, amount: 230 },
        { personId: LEO, amount: 230 },
      ],
      createdAt: '2026-08-12T11:00:00.000Z',
    },
    {
      id: 'e4',
      groupId: 'g_trip',
      description: 'Groceries & snacks',
      amount: 146.8,
      currency: 'USD',
      category: 'groceries',
      paidById: YOU,
      splitMethod: 'equal',
      splits: [
        { personId: YOU, amount: 36.7 },
        { personId: AVA, amount: 36.7 },
        { personId: MIA, amount: 36.7 },
        { personId: LEO, amount: 36.7 },
      ],
      createdAt: '2026-08-14T19:30:00.000Z',
    },
    {
      id: 'e5',
      groupId: 'g_dinner',
      description: 'Ramen night',
      amount: 84,
      currency: 'USD',
      category: 'food',
      paidById: NOAH,
      splitMethod: 'exact',
      splits: [
        { personId: YOU, amount: 28 },
        { personId: NOAH, amount: 32 },
        { personId: MIA, amount: 24 },
      ],
      createdAt: '2026-08-22T20:10:00.000Z',
    },
    {
      id: 'e6',
      groupId: null,
      description: 'Concert tickets',
      amount: 160,
      currency: 'USD',
      category: 'entertainment',
      paidById: YOU,
      splitMethod: 'equal',
      splits: [
        { personId: YOU, amount: 80 },
        { personId: LEO, amount: 80 },
      ],
      note: 'Floor seats',
      createdAt: '2026-08-24T16:00:00.000Z',
    },
  ],
  settlements: [
    {
      id: 's1',
      fromId: AVA,
      toId: YOU,
      amount: 200,
      groupId: 'g_apartment',
      note: 'Partial rent',
      createdAt: '2026-08-08T12:00:00.000Z',
    },
  ],
};

export const YOU_ID = YOU;
