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
}
