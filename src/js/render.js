import Chart from 'chart.js/auto'
import { state } from './store.js'
import { fmt, fmtDayLabel, fmtMonth, catKey } from './utils.js'

const BD_COLORS_EXP = ['#f05454','#f07854','#f0a854','#d4a017','#a8c030','#54b8f0','#7c6fff','#c054f0','#f054b8','#888898']
const BD_COLORS_INC = ['#27c281','#27a8c2','#277fc2','#6c27c2','#c2276c','#c28827']

let chartInst = null

// ─── FILTERED TXS ──────────────────────────────────────────────
export function filtered() {
  return state.txs.filter((t) => t.date.startsWith(state.activeMonth))
}

// ─── MAIN RENDER ───────────────────────────────────────────────
export function render() {
  const txs = filtered()
  const inc  = txs.filter((t) => t.type === 'income')
  const exp  = txs.filter((t) => t.type === 'expense')
  const totInc = inc.reduce((s, t) => s + t.amount, 0)
  const totExp = exp.reduce((s, t) => s + t.amount, 0)

  // Month labels
  const label = fmtMonth(state.activeMonth)
  ;['monthLabel', 'monthLabel2', 'monthLabel3'].forEach((id) => {
    const el = document.getElementById(id)
    if (el) el.textContent = label
  })

  // Savings sub-label
  const sub = document.getElementById('monthSub')
  if (sub) {
    const net = totInc - totExp
    if (totInc > 0) {
      const pct = Math.round((net / totInc) * 100)
      sub.textContent = net >= 0 ? `Saved ${pct}%` : `Over by ${fmt(Math.abs(net))}`
      sub.style.color = net >= 0 ? 'var(--inc)' : 'var(--exp)'
    } else {
      sub.textContent = ''
    }
  }

  // Summary cards
  setText('sumInc', fmt(totInc))
  setText('sumExp', fmt(totExp))
  setText('sumIncCount', `${inc.length} entr${inc.length === 1 ? 'y' : 'ies'}`)
  setText('sumExpCount', `${exp.length} entr${exp.length === 1 ? 'y' : 'ies'}`)

  // Badges
  setText('txBadge',  txs.length)
  setText('txBadge2', txs.length)

  renderChart(txs)
  renderBreakdown(txs)
  renderTxList('txHome',    txs, 30)
  renderTxList('txHistory', txs)
  renderBudget(exp)
  renderCatGrids()
}

// ─── CHART ─────────────────────────────────────────────────────
export function renderChart(txs) {
  const days = {}
  txs.forEach((t) => {
    if (!days[t.date]) days[t.date] = { i: 0, e: 0 }
    days[t.date][t.type === 'income' ? 'i' : 'e'] += t.amount
  })
  const sorted   = Object.keys(days).sort()
  const labels   = sorted.map((d) => new Date(d + 'T00:00:00').toLocaleDateString('default', { day: 'numeric', month: 'short' }))
  const incData  = sorted.map((d) => days[d].i)
  const expData  = sorted.map((d) => days[d].e)
  const isDark   = document.documentElement.getAttribute('data-theme') === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const tickColor = isDark ? '#4a4a5a' : '#b0b0be'

  const ctx = document.getElementById('chart')?.getContext('2d')
  if (!ctx) return
  if (chartInst) chartInst.destroy()

  chartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income',  data: incData, backgroundColor: isDark ? 'rgba(39,194,129,0.65)'  : 'rgba(26,173,112,0.55)',  borderRadius: 4, borderSkipped: false },
        { label: 'Expense', data: expData, backgroundColor: isDark ? 'rgba(240,84,84,0.65)'   : 'rgba(224,62,62,0.55)',   borderRadius: 4, borderSkipped: false },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#1e1e26' : '#ffffff',
          titleColor: isDark ? '#eeeef0' : '#1a1a20',
          bodyColor:  isDark ? '#888898' : '#6a6a78',
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          borderWidth: 1, padding: 10,
          callbacks: { label: (c) => ' ' + fmt(c.raw) },
        },
      },
      scales: {
        x: { ticks: { color: tickColor, font: { size: 9, family: 'Geist Mono' } }, grid: { color: gridColor }, border: { display: false } },
        y: { ticks: { color: tickColor, font: { size: 9, family: 'Geist Mono' }, callback: (v) => v >= 1e6 ? (v / 1e6).toFixed(0) + 'jt' : v >= 1e3 ? (v / 1e3).toFixed(0) + 'k' : '' + v }, grid: { color: gridColor }, border: { display: false } },
      },
    },
  })
}

// ─── BREAKDOWN ─────────────────────────────────────────────────
export function renderBreakdown(txs) {
  const el = document.getElementById('bdList')
  if (!el) return

  const colors = state.bdTab === 'expense' ? BD_COLORS_EXP : BD_COLORS_INC
  const items  = txs.filter((t) => t.type === state.bdTab)
  const totals = {}
  items.forEach((t) => { totals[t.category] = (totals[t.category] || 0) + t.amount })
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])
  const grand  = sorted.reduce((s, [, v]) => s + v, 0)

  if (!sorted.length) {
    el.innerHTML = `<div class="bd-empty">No ${state.bdTab} data this month</div>`
    return
  }

  el.innerHTML = sorted.map(([key, val], i) => {
    const cat  = findCat(state.bdTab, key)
    const ico  = cat ? cat.e : '💳'
    const name = cat ? cat.n : key
    const pct  = grand > 0 ? (val / grand) * 100 : 0
    const color     = colors[i % colors.length]
    const amtColor  = state.bdTab === 'expense' ? 'color:var(--exp)' : 'color:var(--inc)'
    return `<div class="bd-row">
      <span class="bd-emoji">${ico}</span>
      <span class="bd-name">${name}</span>
      <div class="bd-bar-wrap"><div class="bd-bar-track"><div class="bd-bar-fill" style="width:${pct}%;background:${color}"></div></div></div>
      <span class="bd-pct">${Math.round(pct)}%</span>
      <span class="bd-amount" style="${amtColor}">${fmt(val)}</span>
    </div>`
  }).join('')
}

// ─── TX LIST ───────────────────────────────────────────────────
export function renderTxList(id, txs, limit) {
  const el = document.getElementById(id)
  if (!el) return

  const sorted = txs.slice().sort((a, b) => new Date(b.date) - new Date(a.date))
  const items  = limit ? sorted.slice(0, limit) : sorted

  if (!items.length) {
    el.innerHTML = `<div class="empty-wrap"><div class="empty-ico">○</div><div class="empty-msg">No transactions this month.<br/>Tap + to add one.</div></div>`
    return
  }

  const groups = {}
  items.forEach((t) => {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  })

  el.innerHTML = Object.keys(groups).sort().reverse().map((date, gi) => {
    const rows = groups[date].map((t, i) => {
      const cat  = findCat(t.type, t.category)
      const ico  = cat ? cat.e : '💳'
      const name = cat ? cat.n : t.category
      const delay = (gi * 3 + i) * 0.03
      return `<div class="tx-item" style="animation-delay:${delay}s">
        <div class="tx-emoji" style="background:${t.type === 'income' ? 'var(--inc-bg)' : 'var(--exp-bg)'}">${ico}</div>
        <div class="tx-body">
          <div class="tx-name">${t.note || name}</div>
          <div class="tx-cat-label">${name}</div>
        </div>
        <div class="tx-right">
          <div class="tx-amt ${t.type === 'income' ? 'inc' : 'exp'}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</div>
        </div>
        <button class="tx-del" data-id="${t.id}" title="Delete">✕</button>
      </div>`
    }).join('')
    return `<div class="tx-group"><div class="tx-date-label">${fmtDayLabel(date)}</div>${rows}</div>`
  }).join('')

  // Bind delete buttons
  el.querySelectorAll('.tx-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { deleteTx } = window.__catat__
      deleteTx(btn.dataset.id)
    })
  })
}

// ─── BUDGET ────────────────────────────────────────────────────
export function renderBudget(expTxs) {
  const el = document.getElementById('budgetList')
  if (!el) return

  const spent = {}
  expTxs.forEach((t) => { spent[t.category] = (spent[t.category] || 0) + t.amount })

  el.innerHTML = state.cats.expense.map((c) => {
    const key = catKey(c)
    const s   = spent[key] || 0
    const b   = state.budgets[key] || 0
    const pct = b > 0 ? Math.min(100, (s / b) * 100) : 0
    const cls = pct < 70 ? 'fill-ok' : pct < 100 ? 'fill-warn' : 'fill-over'
    return `<div class="budget-row">
      <div class="brow-left">
        <div class="brow-cat">${c.e} ${c.n}</div>
        ${b > 0
          ? `<div class="brow-prog"><div class="brow-bar"><div class="brow-fill ${cls}" style="width:${pct}%"></div></div><div class="brow-sub">${fmt(s)} / ${fmt(b)} · ${Math.round(pct)}% used</div></div>`
          : `<div class="brow-sub" style="margin-top:3px">${s > 0 ? fmt(s) + ' spent' : 'No budget set'}</div>`
        }
      </div>
      <input class="budget-inp" type="number" min="0" placeholder="Set limit"
        value="${b || ''}" data-key="${key}" />
    </div>`
  }).join('')

  el.querySelectorAll('.budget-inp').forEach((inp) => {
    inp.addEventListener('change', () => {
      const { setBudget } = window.__catat__
      setBudget(inp.dataset.key, inp.value)
    })
  })
}

// ─── CATEGORY GRIDS ────────────────────────────────────────────
export function renderCatGrids() {
  renderCatGrid('catGridExp', 'expense')
  renderCatGrid('catGridInc', 'income')
}

function renderCatGrid(id, type) {
  const el = document.getElementById(id)
  if (!el) return

  const { DEFAULT_CATS } = window.__catat__
  const defaults = DEFAULT_CATS[type].map(catKey)

  el.innerHTML = (state.cats[type] || []).map((c) => {
    const key      = catKey(c)
    const isCustom = !defaults.includes(key)
    return `<div class="cat-chip${isCustom ? ' custom' : ''}">
      ${c.e} ${c.n}
      ${isCustom ? `<button class="cat-chip-del" data-type="${type}" data-key="${key}">✕</button>` : ''}
    </div>`
  }).join('')

  el.querySelectorAll('.cat-chip-del').forEach((btn) => {
    btn.addEventListener('click', () => {
      const { deleteCat } = window.__catat__
      deleteCat(btn.dataset.type, btn.dataset.key)
    })
  })
}

// ─── CAT SELECT IN DRAWER ──────────────────────────────────────
export function updateCatSelect() {
  const sel = document.getElementById('fCat')
  if (!sel) return
  sel.innerHTML = (state.cats[state.currentType] || []).map((c) => {
    const k = catKey(c)
    return `<option value="${k}">${c.e} ${c.n}</option>`
  }).join('')
}

// ─── HELPERS ───────────────────────────────────────────────────
function findCat(type, key) {
  return (state.cats[type] || []).find((c) => catKey(c) === key)
}

function setText(id, val) {
  const el = document.getElementById(id)
  if (el) el.textContent = val
}
