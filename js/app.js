// Expense & Budget Visualizer — app.js
// MVC-lite: transactions array = model, render* functions = view, event listeners = controller

let transactions = [];
let chartInstance = null;
let customCategories = [];
let sortMode = 'date';

// ---------------------------------------------------------------------------
// Warning banner
// ---------------------------------------------------------------------------

function showWarningBanner(message) {
  const banner = document.getElementById('warning-banner');
  if (!banner) return;
  banner.textContent = message;
  banner.classList.remove('hidden');
  if (!banner.querySelector('.banner-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'banner-close';
    closeBtn.setAttribute('aria-label', 'Dismiss warning');
    closeBtn.textContent = '\u00d7';
    closeBtn.addEventListener('click', () => banner.classList.add('hidden'));
    banner.appendChild(closeBtn);
  }
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '\u2600\ufe0f Light Mode' : '\ud83c\udf19 Dark Mode';
}

// ---------------------------------------------------------------------------
// Custom categories
// ---------------------------------------------------------------------------

function loadCustomCategories() {
  try {
    const raw = localStorage.getItem('customCategories');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCustomCategories() {
  localStorage.setItem('customCategories', JSON.stringify(customCategories));
}

function allCategories() {
  return ['Food', 'Transport', 'Fun', ...customCategories];
}

function refreshCategorySelect() {
  const select = document.getElementById('category');
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">-- Select category --</option>';
  for (const cat of allCategories()) {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  }
  select.value = current;
}

// ---------------------------------------------------------------------------
// Storage / Model
// ---------------------------------------------------------------------------

function loadTransactions() {
  try {
    const raw = localStorage.getItem('transactions');
    if (raw === null) return [];
    return JSON.parse(raw);
  } catch (e) {
    showWarningBanner('Could not load saved transactions. Starting with an empty list.');
    return [];
  }
}

function saveTransactions(txns) {
  try {
    localStorage.setItem('transactions', JSON.stringify(txns));
  } catch (e) {
    showWarningBanner('Could not save transactions. Storage may be unavailable.');
  }
}

function addTransaction(itemName, amount, category) {
  const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : Date.now().toString() + Math.random();
  const transaction = { id, itemName, amount, category, createdAt: Date.now() };
  transactions.push(transaction);
  saveTransactions(transactions);
  return transaction;
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions(transactions);
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

function validate(formData) {
  const errors = {};
  if (!formData.itemName || formData.itemName.trim() === '') {
    errors.itemName = 'Item name is required.';
  }
  const parsedAmount = parseFloat(formData.amount);
  if (!isFinite(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'Amount must be a positive number.';
  }
  if (!allCategories().includes(formData.category)) {
    errors.category = 'Please select a category.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// ---------------------------------------------------------------------------
// View — Balance
// ---------------------------------------------------------------------------

function formatCurrency(value) {
  return '$' + value.toFixed(2);
}

function renderBalance(txns) {
  const balanceEl = document.getElementById('balance');
  if (!balanceEl) return;
  const total = txns.reduce((sum, t) => sum + t.amount, 0);
  balanceEl.textContent = formatCurrency(total);
}

// ---------------------------------------------------------------------------
// View — Chart
// ---------------------------------------------------------------------------

const BUILTIN_COLORS = { Food: '#FF6384', Transport: '#36A2EB', Fun: '#FFCE56' };
const EXTRA_PALETTE  = ['#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#7CFC00', '#FF6347'];

function categoryColor(cat, index) {
  return BUILTIN_COLORS[cat] || EXTRA_PALETTE[index % EXTRA_PALETTE.length];
}

function renderChart(txns) {
  const canvas = document.getElementById('chart');
  if (!canvas) return;
  if (typeof window.Chart === 'undefined') {
    const msg = document.createElement('p');
    msg.className = 'chart-fallback';
    msg.textContent = 'Chart unavailable: Chart.js could not be loaded.';
    canvas.parentElement.insertBefore(msg, canvas);
    return;
  }
  const totals = {};
  for (const txn of txns) {
    totals[txn.category] = (totals[txn.category] || 0) + txn.amount;
  }
  const labels = Object.keys(totals).filter(cat => totals[cat] > 0);
  const data   = labels.map(cat => totals[cat]);
  const colors = labels.map((cat, i) => categoryColor(cat, i));
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  chartInstance = new window.Chart(canvas, {
    type: 'pie',
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: { plugins: { legend: { display: true, position: 'bottom' } } },
  });
}

// ---------------------------------------------------------------------------
// View — Transaction List (with sort)
// ---------------------------------------------------------------------------

function sortedTransactions(txns) {
  const copy = txns.slice();
  switch (sortMode) {
    case 'amount-asc':  return copy.sort((a, b) => a.amount - b.amount);
    case 'amount-desc': return copy.sort((a, b) => b.amount - a.amount);
    case 'category':    return copy.sort((a, b) => a.category.localeCompare(b.category));
    default:            return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
}

function renderList(txns) {
  const listEl = document.getElementById('transaction-list');
  if (!listEl) return;
  listEl.replaceChildren();
  if (txns.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = 'No transactions recorded.';
    listEl.appendChild(li);
    return;
  }
  for (const txn of sortedTransactions(txns)) {
    const li = document.createElement('li');
    li.className = 'transaction-item';

    const info = document.createElement('div');
    info.className = 'transaction-info';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'transaction-name';
    nameSpan.textContent = txn.itemName;

    const meta = document.createElement('span');
    meta.className = 'transaction-meta';
    meta.textContent = txn.category;

    info.appendChild(nameSpan);
    info.appendChild(meta);

    const amountSpan = document.createElement('span');
    amountSpan.className = 'transaction-amount';
    amountSpan.textContent = formatCurrency(txn.amount);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.id = txn.id;

    li.appendChild(info);
    li.appendChild(amountSpan);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setFieldError(errorId, message) {
  const el = document.getElementById(errorId);
  if (!el) return;
  el.textContent = message || '';
}

function clearFormErrors() {
  setFieldError('item-name-error', '');
  setFieldError('amount-error', '');
  setFieldError('category-error', '');
}

function rerender() {
  renderBalance(transactions);
  renderList(transactions);
  renderChart(transactions);
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Theme
  applyTheme(localStorage.getItem('theme') || 'light');
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Custom categories
  customCategories = loadCustomCategories();
  refreshCategorySelect();

  const addCatBtn   = document.getElementById('add-category-btn');
  const newCatInput = document.getElementById('new-category-input');
  const catError    = document.getElementById('new-category-error');
  if (addCatBtn && newCatInput) {
    addCatBtn.addEventListener('click', () => {
      const name = newCatInput.value.trim();
      if (!name) { catError.textContent = 'Enter a category name.'; return; }
      if (allCategories().map(c => c.toLowerCase()).includes(name.toLowerCase())) {
        catError.textContent = 'Category already exists.'; return;
      }
      catError.textContent = '';
      customCategories.push(name);
      saveCustomCategories();
      refreshCategorySelect();
      newCatInput.value = '';
    });
  }

  // Sort
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    sortMode = e.target.value;
    renderList(transactions);
  });

  // Load & render
  transactions = loadTransactions();
  rerender();

  // Form submit
  const form = document.getElementById('expense-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = {
        itemName: form.elements['itemName'].value,
        amount:   form.elements['amount'].value,
        category: form.elements['category'].value,
      };
      const { valid, errors } = validate(formData);
      if (!valid) {
        setFieldError('item-name-error', errors.itemName || '');
        setFieldError('amount-error',    errors.amount   || '');
        setFieldError('category-error',  errors.category || '');
        return;
      }
      clearFormErrors();
      addTransaction(formData.itemName.trim(), parseFloat(formData.amount), formData.category);
      form.reset();
      rerender();
    });
  }

  // Delete
  document.getElementById('transaction-list')?.addEventListener('click', (event) => {
    const btn = event.target.closest('.btn-delete');
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) return;
    deleteTransaction(id);
    rerender();
  });
});
