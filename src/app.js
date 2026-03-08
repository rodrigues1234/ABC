import { loadState, nextId, saveState } from './store.js';

const app = {
  password: null,
  state: null,
};

const unlockScreen = document.getElementById('unlock-screen');
const mainScreen = document.getElementById('main-screen');
const authHint = document.getElementById('auth-hint');

function fmt(v) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(v || 0);
}

function computeDashboard(state) {
  const qtyByAsset = new Map();
  let invested = 0;
  let income = 0;
  let cash = 0;
  state.transactions.forEach((tx) => {
    if (tx.type === 'BUY') {
      qtyByAsset.set(tx.assetId, (qtyByAsset.get(tx.assetId) || 0) + Number(tx.quantity || 0));
      invested += Number(tx.total || 0);
      cash -= Number(tx.total || 0);
    }
    if (tx.type === 'SELL') {
      qtyByAsset.set(tx.assetId, (qtyByAsset.get(tx.assetId) || 0) - Number(tx.quantity || 0));
      cash += Number(tx.total || 0);
    }
    if (tx.type === 'DEPOSIT') cash += Number(tx.total || 0);
    if (tx.type === 'WITHDRAW') cash -= Number(tx.total || 0);
    if (tx.type === 'DIVIDEND' || tx.type === 'INTEREST') {
      income += Number(tx.total || 0);
      cash += Number(tx.total || 0);
    }
  });

  const latestPrice = new Map();
  state.prices.forEach((p) => {
    const curr = latestPrice.get(p.assetId);
    if (!curr || curr.date < p.date) latestPrice.set(p.assetId, p);
  });

  let portfolioValue = 0;
  qtyByAsset.forEach((qty, assetId) => {
    const price = latestPrice.get(assetId)?.price || 0;
    portfolioValue += qty * Number(price);
  });

  const totalValue = portfolioValue + cash;
  const gain = totalValue + income - invested;
  const roi = invested ? (gain / invested) * 100 : 0;
  return { totalValue, invested, gain, roi, cash, income };
}

function renderTable(target, headers, rows) {
  target.innerHTML = `
    <table class="table">
      <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.length ? rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('') : '<tr><td colspan="99" class="muted">Sem registos.</td></tr>'}
      </tbody>
    </table>
  `;
}

function renderDashboard() {
  const panel = document.getElementById('tab-dashboard');
  const k = computeDashboard(app.state);
  panel.innerHTML = `
    <div class="grid">
      <article class="card kpi"><div class="label">Valor total</div><div class="value">${fmt(k.totalValue)}</div></article>
      <article class="card kpi"><div class="label">Investido acumulado</div><div class="value">${fmt(k.invested)}</div></article>
      <article class="card kpi"><div class="label">Ganho/Perda</div><div class="value ${k.gain >= 0 ? 'profit' : ''}">${fmt(k.gain)}</div></article>
      <article class="card kpi"><div class="label">Rentabilidade</div><div class="value">${k.roi.toFixed(2)}%</div></article>
      <article class="card kpi"><div class="label">Cash</div><div class="value">${fmt(k.cash)}</div></article>
      <article class="card kpi"><div class="label">Income</div><div class="value">${fmt(k.income)}</div></article>
    </div>
  `;
}

function renderOwners() {
  const panel = document.getElementById('tab-owners');
  panel.innerHTML = `
    <div class="card form-card">
      <h3>Novo owner</h3>
      <form id="owner-form" class="row">
        <input name="name" placeholder="Nome" required />
        <input name="type" placeholder="Tipo (Pessoa/Entidade)" required />
        <button>Guardar</button>
      </form>
    </div>
    <div id="owners-table" class="card"></div>
  `;
  document.getElementById('owner-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    app.state.owners.push({ id: nextId('own'), name: form.get('name'), type: form.get('type') });
    await saveState(app.password, app.state);
    renderAll();
  };
  renderTable(document.getElementById('owners-table'), ['Nome', 'Tipo'], app.state.owners.map((o) => [o.name, o.type]));
}

function renderAccounts() {
  const panel = document.getElementById('tab-accounts');
  panel.innerHTML = `
    <div class="card form-card">
      <h3>Nova conta</h3>
      <form id="account-form" class="row">
        <input name="name" placeholder="Nome" required />
        <input name="institution" placeholder="Instituição" required />
        <select name="ownerId" required>
          <option value="">Owner</option>
          ${app.state.owners.map((o) => `<option value="${o.id}">${o.name}</option>`).join('')}
        </select>
        <button>Guardar</button>
      </form>
    </div>
    <div id="accounts-table" class="card"></div>
  `;
  document.getElementById('account-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    app.state.accounts.push({ id: nextId('acc'), name: form.get('name'), institution: form.get('institution'), ownerId: form.get('ownerId') });
    await saveState(app.password, app.state);
    renderAll();
  };
  renderTable(document.getElementById('accounts-table'), ['Conta', 'Instituição', 'Owner'], app.state.accounts.map((a) => [a.name, a.institution, app.state.owners.find((o) => o.id === a.ownerId)?.name || '-']));
}

function renderAssets() {
  const panel = document.getElementById('tab-assets');
  panel.innerHTML = `
    <div class="card form-card">
      <h3>Novo ativo</h3>
      <form id="asset-form" class="row">
        <input name="name" placeholder="Nome" required />
        <input name="ticker" placeholder="Ticker" required />
        <input name="assetType" placeholder="Tipo" required />
        <button>Guardar</button>
      </form>
    </div>
    <div id="assets-table" class="card"></div>
  `;
  document.getElementById('asset-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    app.state.assets.push({ id: nextId('ast'), name: form.get('name'), ticker: form.get('ticker'), assetType: form.get('assetType') });
    await saveState(app.password, app.state);
    renderAll();
  };
  renderTable(document.getElementById('assets-table'), ['Nome', 'Ticker', 'Tipo'], app.state.assets.map((a) => [a.name, a.ticker, a.assetType]));
}

function renderTransactions() {
  const panel = document.getElementById('tab-transactions');
  panel.innerHTML = `
    <div class="card form-card">
      <h3>Novo movimento</h3>
      <form id="tx-form" class="row">
        <input type="date" name="date" required />
        <select name="type" required>
          <option value="BUY">Compra</option>
          <option value="SELL">Venda</option>
          <option value="DEPOSIT">Depósito</option>
          <option value="WITHDRAW">Levantamento</option>
          <option value="DIVIDEND">Dividendo</option>
          <option value="INTEREST">Juro</option>
        </select>
        <select name="ownerId" required>${app.state.owners.map((o) => `<option value="${o.id}">${o.name}</option>`).join('')}</select>
        <select name="accountId" required>${app.state.accounts.map((a) => `<option value="${a.id}">${a.name}</option>`).join('')}</select>
        <select name="assetId"><option value="">Sem ativo</option>${app.state.assets.map((a) => `<option value="${a.id}">${a.ticker}</option>`).join('')}</select>
        <input type="number" step="0.0001" name="quantity" placeholder="Qtd" />
        <input type="number" step="0.01" name="total" placeholder="Total" required />
        <button>Guardar</button>
      </form>
    </div>
    <div id="tx-table" class="card"></div>
  `;
  document.getElementById('tx-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    app.state.transactions.push({
      id: nextId('tx'),
      date: form.get('date'),
      type: form.get('type'),
      ownerId: form.get('ownerId'),
      accountId: form.get('accountId'),
      assetId: form.get('assetId') || null,
      quantity: Number(form.get('quantity') || 0),
      total: Number(form.get('total') || 0),
    });
    await saveState(app.password, app.state);
    renderAll();
  };
  renderTable(document.getElementById('tx-table'), ['Data', 'Tipo', 'Owner', 'Conta', 'Ativo', 'Quantidade', 'Total'], app.state.transactions.map((t) => [
    t.date,
    t.type,
    app.state.owners.find((o) => o.id === t.ownerId)?.name || '-',
    app.state.accounts.find((a) => a.id === t.accountId)?.name || '-',
    app.state.assets.find((a) => a.id === t.assetId)?.ticker || '-',
    String(t.quantity || 0),
    fmt(t.total || 0),
  ]));
}

function renderAll() {
  renderDashboard();
  renderOwners();
  renderAccounts();
  renderAssets();
  renderTransactions();
}

async function unlock() {
  const password = document.getElementById('master-password').value;
  if (!password || password.length < 6) {
    authHint.textContent = 'Password inválida (mínimo 6 caracteres).';
    return;
  }
  try {
    const state = await loadState(password);
    app.password = password;
    app.state = state;
    unlockScreen.classList.remove('active');
    mainScreen.classList.add('active');
    renderAll();
  } catch {
    authHint.textContent = 'Não foi possível desbloquear (password incorreta ou dados corrompidos).';
  }
}

document.getElementById('unlock-btn').addEventListener('click', unlock);
document.getElementById('master-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') unlock();
});

document.getElementById('lock-btn').addEventListener('click', () => {
  app.password = null;
  app.state = null;
  document.getElementById('master-password').value = '';
  authHint.textContent = '';
  mainScreen.classList.remove('active');
  unlockScreen.classList.add('active');
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('public/sw.js').catch(() => null);
}
