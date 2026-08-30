import { encode as btoa } from 'base-64';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { uid } from './format';
import type { AppState, Expense, Group, Person, Settlement } from './types';

const CURRENT_VERSION = 1;

/** Generate a random encryption key (base64) */
export async function generateKey(): Promise<string> {
  const key = await Crypto.getRandomBytesAsync(32);
  return btoa(String.fromCharCode(...key));
}

/** Encrypt data with passphrase using expo-crypto AES-GCM */
export async function encryptData(data: string, passphrase: string): Promise<string> {
  // Derive a key from passphrase using simple hash (for demo - in production use proper KDF)
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);
  const hashBuffer = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, passphraseBytes);
  const keyBytes = new Uint8Array(hashBuffer);
  
  // Import key for AES - convert to base64 string first
  const keyBase64 = btoa(String.fromCharCode(...keyBytes));
  const key = await Crypto.AESEncryptionKey.import(keyBase64, 'base64');
  
  // Generate random IV
  const iv = await Crypto.getRandomBytesAsync(12);
  
  // Encrypt
  const sealedData = await Crypto.aesEncryptAsync(encoder.encode(data), key, {
    nonce: { bytes: iv },
    tagLength: 16,
  });
  
  // Get combined data (iv + ciphertext + tag)
  const combined = await sealedData.combined('base64');
  
  return combined as string;
}

/** Decrypt data with passphrase */
export async function decryptData(encryptedB64: string, passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);
  const hashBuffer = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, passphraseBytes);
  const keyBytes = new Uint8Array(hashBuffer);
  
  // Import key for AES - convert to base64 string first
  const keyBase64 = btoa(String.fromCharCode(...keyBytes));
  const key = await Crypto.AESEncryptionKey.import(keyBase64, 'base64');
  
  // Create sealed data from combined base64
  const sealedData = Crypto.AESSealedData.fromCombined(encryptedB64, {
    ivLength: 12,
    tagLength: 16,
  });
  
  // Decrypt
  const decrypted = await Crypto.aesDecryptAsync(sealedData, key, {
    output: 'base64',
  });
  
  return decrypted as string;
}

/** Export current state as encrypted JSON */
export async function exportEncrypted(state: AppState, passphrase: string): Promise<string> {
  const exportData = {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    data: state,
  };
  const json = JSON.stringify(exportData);
  return encryptData(json, passphrase);
}

/** Import encrypted JSON */
export async function importEncrypted(encryptedB64: string, passphrase: string): Promise<AppState> {
  const json = await decryptData(encryptedB64, passphrase);
  const parsed = JSON.parse(json);
  if (parsed.version !== CURRENT_VERSION) {
    throw new Error(`Unsupported export version: ${parsed.version}`);
  }
  return parsed.data as AppState;
}

/** Export to file and share */
export async function exportToFile(state: AppState, passphrase: string, filename = 'contribute-backup.json') {
  try {
    const encrypted = await exportEncrypted(state, passphrase);
    const file = new File(Paths.cache, filename);
    await file.write(encrypted, { encoding: 'utf8' });
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export Contribute Data' });
    return true;
  } catch (error) {
    console.error('Export failed:', error);
    Alert.alert('Export Failed', 'Could not create backup file');
    return false;
  }
}

/** Import from file picker */
export async function importFromFile(passphrase: string): Promise<AppState | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return null;
    const uri = result.assets[0].uri;
    const file = new File(uri);
    const encrypted = await file.text();
    const state = await importEncrypted(encrypted, passphrase);
    return state;
  } catch (error) {
    console.error('Import failed:', error);
    Alert.alert('Import Failed', 'Could not read backup file. Check passphrase.');
    return null;
  }
}

/** Parse Splitwise CSV export */
export function parseSplitwiseCSV(csvText: string): {
  people: Person[];
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
} {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV appears empty');

  // Detect format: Splitwise exports have headers like:
  // "date","description","category","cost","currency","group","paid by","split with","you paid","you owe","notes"
  const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim().toLowerCase());
  const dateIdx = headers.indexOf('date');
  const descIdx = headers.indexOf('description');
  const catIdx = headers.indexOf('category');
  const costIdx = headers.indexOf('cost');
  const currencyIdx = headers.indexOf('currency');
  const groupIdx = headers.indexOf('group');
  const paidByIdx = headers.indexOf('paid by');
  const splitWithIdx = headers.indexOf('split with');
  const youPaidIdx = headers.indexOf('you paid');
  const youOweIdx = headers.indexOf('you owe');
  const notesIdx = headers.indexOf('notes');

  if (dateIdx === -1 || costIdx === -1) {
    throw new Error('Unrecognized CSV format — expected Splitwise export');
  }

  const peopleMap = new Map<string, Person>();
  const groupsMap = new Map<string, Group>();
  const expenses: Expense[] = [];
  const settlements: Settlement[] = [];

  // Helper to get or create person
  const getPerson = (name: string, isYou = false): Person => {
    const key = name.toLowerCase().trim();
    if (!peopleMap.has(key)) {
      peopleMap.set(key, {
        id: uid('p'),
        name: name.trim(),
        email: `${key.replace(/\s+/g, '.')}@imported.local`,
        avatarColor: '#666',
        isYou,
      });
    }
    return peopleMap.get(key)!;
  };

  // Helper to get or create group
  const getGroup = (name: string, memberIds: string[]): Group | null => {
    if (!name || name.trim() === '') return null;
    const key = name.toLowerCase().trim();
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        id: uid('g'),
        name: name.trim(),
        emoji: '◎',
        memberIds,
        createdAt: new Date().toISOString(),
      });
    }
    return groupsMap.get(key)!;
  };

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < Math.max(dateIdx, costIdx, descIdx) + 1) continue;

    const date = cols[dateIdx] ? new Date(cols[dateIdx]).toISOString() : new Date().toISOString();
    const description = cols[descIdx] ?? 'Imported expense';
    const category = mapCategory(cols[catIdx] ?? '');
    const cost = parseFloat(cols[costIdx] ?? '0');
    const currency = cols[currencyIdx] ?? 'USD';
    const groupName = cols[groupIdx] ?? '';
    const paidByName = cols[paidByIdx] ?? '';
    const splitWithNames = cols[splitWithIdx] ? cols[splitWithIdx].split(',').map((s) => s.trim()) : [];
    const youPaid = parseFloat(cols[youPaidIdx] ?? '0') || 0;
    const youOwe = parseFloat(cols[youOweIdx] ?? '0') || 0;
    const note = cols[notesIdx] ?? '';

    // Determine participants
    const allNames = new Set([paidByName, ...splitWithNames].filter(Boolean));
    const participants = Array.from(allNames).map((n) => getPerson(n));
    const paidBy = getPerson(paidByName);
    const participantIds = participants.map((p) => p.id);

    // Determine split method from youPaid/youOwe
    // If youPaid > 0 and youOwe > 0, it's a partial payment scenario
    // For simplicity, use equal splits among participants
    const splits = buildEqualSplitsForImport(cost, participantIds, paidBy.id);

    const expense: Expense = {
      id: uid('e'),
      groupId: groupName ? getGroup(groupName, participantIds)?.id ?? null : null,
      description: description.trim(),
      amount: cost,
      currency,
      category,
      paidById: paidBy.id,
      splits,
      splitMethod: 'equal',
      note: note.trim() || undefined,
      createdAt: date,
    };
    expenses.push(expense);
  }

  // Mark first person as "You" if not already set
  let youSet = false;
  for (const person of peopleMap.values()) {
    if (!youSet) {
      person.isYou = true;
      youSet = true;
    }
  }

  return {
    people: Array.from(peopleMap.values()),
    groups: Array.from(groupsMap.values()),
    expenses,
    settlements,
  };
}

/** Simple CSV line parser handling quoted fields */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((c) => c.trim());
}

/** Map Splitwise category to our CategoryId */
function mapCategory(cat: string): 'general' | 'food' | 'travel' | 'home' | 'entertainment' | 'utilities' | 'groceries' | 'transport' | 'health' | 'other' {
  const lower = cat.toLowerCase();
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('dining')) return 'food';
  if (lower.includes('grocer')) return 'groceries';
  if (lower.includes('travel') || lower.includes('flight') || lower.includes('hotel')) return 'travel';
  if (lower.includes('home') || lower.includes('rent') || lower.includes('mortgage')) return 'home';
  if (lower.includes('entertain') || lower.includes('movie') || lower.includes('game')) return 'entertainment';
  if (lower.includes('util') || lower.includes('electric') || lower.includes('water') || lower.includes('internet')) return 'utilities';
  if (lower.includes('transport') || lower.includes('uber') || lower.includes('lyft') || lower.includes('taxi') || lower.includes('gas')) return 'transport';
  if (lower.includes('health') || lower.includes('medical') || lower.includes('pharmacy')) return 'health';
  return 'general';
}

/** Build equal splits for import (handles youPaid/youOwe logic if needed) */
function buildEqualSplitsForImport(total: number, personIds: string[], paidById: string) {
  if (personIds.length === 0) return [];
  const base = Math.floor((total * 100) / personIds.length) / 100;
  const splits = personIds.map((personId) => ({
    personId,
    amount: personId === paidById ? 0 : base,
  }));
  // Adjust so sum equals total (excluding payer)
  const nonPayerCount = personIds.filter((id) => id !== paidById).length;
  if (nonPayerCount > 0) {
    const perPerson = total / nonPayerCount;
    const baseCents = Math.floor(perPerson * 100) / 100;
    let allocated = 0;
    splits.forEach((s, idx) => {
      if (s.personId !== paidById) {
        s.amount = baseCents;
        allocated += baseCents;
      }
    });
    const remainder = Math.round((total - allocated) * 100) / 100;
    const firstNonPayer = splits.findIndex((s) => s.personId !== paidById);
    if (firstNonPayer >= 0 && remainder !== 0) {
      splits[firstNonPayer].amount = Math.round((splits[firstNonPayer].amount + remainder) * 100) / 100;
    }
  }
  return splits;
}