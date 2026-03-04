// ─── FORMAT CURRENCY ───────────────────────────────────────────
export function fmt(n) {
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(2) + 'M'
  if (n >= 1_000_000)     return 'Rp ' + (n / 1_000_000).toFixed(1) + 'jt'
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

// ─── FORMAT DATE LABEL ─────────────────────────────────────────
export function fmtDayLabel(dateStr) {
  const d     = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.getTime() === today.getTime())     return 'Today'
  if (d.getTime() === yesterday.getTime()) return 'Yesterday'
  return d.toLocaleDateString('default', { weekday: 'short', day: 'numeric', month: 'short' })
}

// ─── FORMAT MONTH LABEL ────────────────────────────────────────
export function fmtMonth(ym) {
  const [y, m] = ym.split('-')
  return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

// ─── CURRENT YEAR-MONTH STRING ─────────────────────────────────
export function nowYM() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}

// ─── SHIFT MONTH ───────────────────────────────────────────────
export function shiftYM(ym, delta) {
  const [y, m] = ym.split('-').map(Number)
  const dt = new Date(y, m - 1 + delta, 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

// ─── CATEGORY KEY ──────────────────────────────────────────────
export function catKey(cat) {
  return `${cat.e} ${cat.n}`
}
