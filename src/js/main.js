import { state, loadState, saveState, seedIfEmpty, DEFAULT_CATS } from './store.js'
import { render, renderBreakdown, updateCatSelect, filtered } from './render.js'
import { nowYM, shiftYM, catKey } from './utils.js'

function applyLayout() {
  const mobile = window.innerWidth < 700;
  document.getElementById('sidebar').style.display      = mobile ? 'none'  : 'flex';
  document.getElementById('mobileHeader').style.display = mobile ? 'flex'  : 'none';
  document.getElementById('mobileNav').style.display    = mobile ? 'block' : 'none';
  document.getElementById('mainContent').style.padding  = mobile ? '16px 16px 100px' : '40px 48px 80px';
  document.getElementById('fab').style.bottom           = mobile ? '74px' : '32px';
}
window.addEventListener('resize', applyLayout);

// Expose helpers for inline event handlers in render.js
window.__catat__ = { deleteTx, setBudget, deleteCat, DEFAULT_CATS }

// ─── INIT ──────────────────────────────────────────────────────
loadState()
seedIfEmpty()
state.activeMonth = nowYM()
document.documentElement.setAttribute('data-theme', state.theme)
updateThemeLabel()
applyLayout()
render()

// ─── NAVIGATION ────────────────────────────────────────────────
function nav(page) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'))
  document.getElementById(`page-${page}`)?.classList.add('active')
  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.classList.toggle('active', el.dataset.nav === page)
  })
  render()
}

document.querySelectorAll('[data-nav]').forEach((btn) => {
  btn.addEventListener('click', () => nav(btn.dataset.nav))
})

// ─── MONTH NAV ─────────────────────────────────────────────────
function shiftMonth(delta) {
  state.activeMonth = shiftYM(state.activeMonth, delta)
  render()
}

;[1, 2, 3].forEach((n) => {
  document.getElementById(`prevMonth${n === 1 ? '' : n}`)?.addEventListener('click', () => shiftMonth(-1))
  document.getElementById(`nextMonth${n === 1 ? '' : n}`)?.addEventListener('click', () => shiftMonth(1))
})

// ─── THEME ─────────────────────────────────────────────────────
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', state.theme)
  updateThemeLabel()
  saveState()
  render()
}

function updateThemeLabel() {
  const label = document.querySelector('.theme-toggle span')
  if (label) label.textContent = state.theme === 'dark' ? 'Dark mode' : 'Light mode'
}

document.getElementById('themeToggle')?.addEventListener('click', toggleTheme)
document.getElementById('themeToggleMobile')?.addEventListener('click', toggleTheme)

// ─── DRAWER ────────────────────────────────────────────────────
function openDrawer() {
  document.getElementById('overlay').classList.add('open')
  document.getElementById('fDate').value = new Date().toISOString().split('T')[0]
  updateCatSelect()
  setTimeout(() => document.getElementById('fAmount')?.focus(), 350)
}

function closeDrawer() {
  document.getElementById('overlay').classList.remove('open')
}

document.getElementById('fab')?.addEventListener('click', openDrawer)
document.getElementById('overlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('overlay')) closeDrawer()
})

// ─── TRANSACTION TYPE ──────────────────────────────────────────
function setType(type) {
  state.currentType = type
  document.getElementById('btn-exp').className = 'type-seg-btn' + (type === 'expense' ? ' active-exp' : '')
  document.getElementById('btn-inc').className = 'type-seg-btn' + (type === 'income'  ? ' active-inc' : '')
  updateCatSelect()
}

document.getElementById('btn-exp')?.addEventListener('click', () => setType('expense'))
document.getElementById('btn-inc')?.addEventListener('click', () => setType('income'))

// ─── ADD TRANSACTION ───────────────────────────────────────────
document.getElementById('addTxBtn')?.addEventListener('click', addTx)
document.getElementById('fAmount')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTx()
})

function addTx() {
  const amount = parseFloat(document.getElementById('fAmount').value)
  if (!amount || amount <= 0) { alert('Enter a valid amount'); return }
  const note = document.getElementById('fNote').value.trim()
  const cat  = document.getElementById('fCat').value
  const date = document.getElementById('fDate').value
  if (!cat)  { alert('Select a category'); return }
  if (!date) { alert('Select a date'); return }

  state.txs.unshift({ id: Date.now() + '', type: state.currentType, amount, note, category: cat, date })
  saveState()
  closeDrawer()

  state.activeMonth = date.substring(0, 7)
  render()

  document.getElementById('fAmount').value = ''
  document.getElementById('fNote').value   = ''
}

// ─── DELETE TRANSACTION ────────────────────────────────────────
function deleteTx(id) {
  state.txs = state.txs.filter((t) => t.id !== id)
  saveState()
  render()
}

// ─── BUDGET ────────────────────────────────────────────────────
function setBudget(key, val) {
  state.budgets[key] = parseFloat(val) || 0
  saveState()
  render()
}

// ─── CATEGORIES ────────────────────────────────────────────────
function addCat(type) {
  const emojiId = type === 'expense' ? 'emojiExp' : 'emojiInc'
  const nameId  = type === 'expense' ? 'newCatExp' : 'newCatInc'
  const e = document.getElementById(emojiId).value.trim() || '🏷️'
  const n = document.getElementById(nameId).value.trim()
  if (!n) return
  state.cats[type].push({ e, n })
  document.getElementById(emojiId).value = ''
  document.getElementById(nameId).value  = ''
  saveState()
  render()
}

function deleteCat(type, key) {
  state.cats[type] = state.cats[type].filter((c) => catKey(c) !== key)
  saveState()
  render()
}

document.getElementById('addCatExp')?.addEventListener('click', () => addCat('expense'))
document.getElementById('addCatInc')?.addEventListener('click', () => addCat('income'))

document.getElementById('newCatExp')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCat('expense') })
document.getElementById('newCatInc')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCat('income')  })

// ─── BREAKDOWN TABS ────────────────────────────────────────────
document.getElementById('bdTabExp')?.addEventListener('click', () => setBdTab('expense'))
document.getElementById('bdTabInc')?.addEventListener('click', () => setBdTab('income'))

function setBdTab(type) {
  state.bdTab = type
  document.getElementById('bdTabExp').className = 'bd-tab' + (type === 'expense' ? ' active-exp' : '')
  document.getElementById('bdTabInc').className  = 'bd-tab' + (type === 'income'  ? ' active-inc' : '')
  renderBreakdown(filtered())
}


