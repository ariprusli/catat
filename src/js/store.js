// ─── DEFAULT DATA ──────────────────────────────────────────────
export const DEFAULT_CATS = {
  expense: [
    { e: '🍔', n: 'Food & Drink' },
    { e: '🚗', n: 'Transport' },
    { e: '🏠', n: 'Housing' },
    { e: '💊', n: 'Health' },
    { e: '🛍️', n: 'Shopping' },
    { e: '🎮', n: 'Entertainment' },
    { e: '📚', n: 'Education' },
    { e: '💡', n: 'Utilities' },
    { e: '✈️', n: 'Travel' },
    { e: '📦', n: 'Other' },
  ],
  income: [
    { e: '💼', n: 'Salary' },
    { e: '🔧', n: 'Freelance' },
    { e: '📈', n: 'Investment' },
    { e: '🎁', n: 'Gift' },
    { e: '💰', n: 'Bonus' },
    { e: '📦', n: 'Other' },
  ],
}

const STORAGE_KEY = 'catat'

// ─── STATE ─────────────────────────────────────────────────────
export const state = {
  txs: [],
  budgets: {},
  cats: JSON.parse(JSON.stringify(DEFAULT_CATS)),
  activeMonth: '',
  theme: 'dark',
  currentType: 'expense',
  bdTab: 'expense',
}

// ─── PERSISTENCE ───────────────────────────────────────────────
export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const d = JSON.parse(saved)
      state.txs     = d.txs     || []
      state.budgets = d.budgets || {}
      state.cats    = d.cats    || JSON.parse(JSON.stringify(DEFAULT_CATS))
      state.theme   = d.theme   || 'dark'
    }
  } catch (e) {
    console.warn('Failed to load state', e)
  }
}

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    txs:     state.txs,
    budgets: state.budgets,
    cats:    state.cats,
    theme:   state.theme,
  }))
}

// ─── SEED DATA ─────────────────────────────────────────────────
export function seedIfEmpty() {
  if (state.txs.length) return
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = (n) => `${y}-${m}-${String(n).padStart(2, '0')}`
  state.txs = [
    { id: 'a1', type: 'income',  amount: 8500000, note: 'Monthly salary',    category: '💼 Salary',       date: d(1) },
    { id: 'a2', type: 'income',  amount: 1200000, note: 'Side project',      category: '🔧 Freelance',    date: d(5) },
    { id: 'a3', type: 'expense', amount: 1800000, note: 'Rent payment',      category: '🏠 Housing',      date: d(1) },
    { id: 'a4', type: 'expense', amount: 85000,   note: 'GoFood lunch',      category: '🍔 Food & Drink', date: d(3) },
    { id: 'a5', type: 'expense', amount: 55000,   note: 'Grab to office',    category: '🚗 Transport',    date: d(4) },
    { id: 'a6', type: 'expense', amount: 299000,  note: 'Netflix + Spotify', category: '🎮 Entertainment',date: d(2) },
    { id: 'a7', type: 'expense', amount: 145000,  note: 'Pharmacy',          category: '💊 Health',       date: d(6) },
    { id: 'a8', type: 'expense', amount: 320000,  note: 'Groceries',         category: '🍔 Food & Drink', date: d(7) },
    { id: 'a9', type: 'income',  amount: 450000,  note: 'Dividend',          category: '📈 Investment',   date: d(9) },
    { id: 'aa', type: 'expense', amount: 75000,   note: 'Listrik token',     category: '💡 Utilities',    date: d(8) },
    { id: 'ab', type: 'expense', amount: 210000,  note: 'New shirt',         category: '🛍️ Shopping',    date: d(10) },
    { id: 'ac', type: 'expense', amount: 65000,   note: 'Coffee + snack',    category: '🍔 Food & Drink', date: d(11) },
  ]
  saveState()
}
