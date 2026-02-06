/*********************************
 * ESTADO GLOBAL
 *********************************/
let state = {
  categories: [],
  transactions: [],
  darkMode: false
};

let editingId = null;

/*********************************
 * LOCAL STORAGE
 *********************************/
const STORAGE_KEY = "controleFinanceiro_v1";

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    state = JSON.parse(data);
  }
}

/*********************************
 * UTILIDADES
 *********************************/
function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function generateID() {
  return Date.now().toString();
}

/*********************************
 * DARK MODE
 *********************************/
const darkBtn = document.getElementById("toggleDarkMode");

function applyDarkMode() {
  document.body.classList.toggle("dark", state.darkMode);
}

darkBtn.addEventListener("click", () => {
  state.darkMode = !state.darkMode;
  applyDarkMode();
  saveStorage();
});

/*********************************
 * CATEGORIAS
 *********************************/
const categoryForm = document.getElementById("categoryForm");
const categoryNameInput = document.getElementById("categoryName");
const categoryList = document.getElementById("categoryList");
const categorySelect = document.getElementById("categorySelect");

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = categoryNameInput.value.trim();
  if (!name) return;

  state.categories.push({
    id: generateID(),
    name
  });

  categoryNameInput.value = "";
  saveStorage();
  renderCategories();
});

function renderCategories() {
  categoryList.innerHTML = "";
  categorySelect.innerHTML = `<option value="">Categoria</option>`;

  state.categories.forEach(cat => {
    // Lista visual
    const li = document.createElement("li");
    li.textContent = cat.name;
    categoryList.appendChild(li);

    // Select
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

/*********************************
 * LANÇAMENTOS
 *********************************/
const transactionForm = document.getElementById("transactionForm");
const transactionTableBody = document.getElementById("transactionTableBody");

transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("categorySelect").value;
  const date = document.getElementById("date").value;
  const installments = Number(document.getElementById("installments").value);
  const isRecurring = document.getElementById("isRecurring").checked;

  if (!description || !amount || !type || !category || !date) return;

  if (editingId) {
    // 🔁 EDITAR
    const tx = state.transactions.find(t => t.id === editingId);
    if (!tx) return;

    tx.description = description;
    tx.amount = amount;
    tx.type = type;
    tx.category = category;
    tx.date = date;

    editingId = null;
    transactionForm.querySelector("button").textContent = "Adicionar Lançamento";

  } else {
    // ➕ NOVO
    if (isRecurring) {
      addRecurring(description, amount, type, category, date);
    } else if (installments > 1) {
      addInstallments(description, amount, type, category, date, installments);
    } else {
      addTransaction(description, amount, type, category, date);
    }
  }

  transactionForm.reset();
  saveStorage();
  renderAll();
});


function addTransaction(desc, amt, type, cat, date) {
  state.transactions.push({
    id: generateID(),
    description: desc,
    amount: amt,
    type,
    category: cat,
    date
  });
}

function addInstallments(desc, amt, type, cat, date, installments) {
  const installmentValue = amt / installments;
  const startDate = new Date(date);

  for (let i = 0; i < installments; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);

    addTransaction(
      `${desc} (${i + 1}/${installments})`,
      installmentValue,
      type,
      cat,
      d.toISOString().split("T")[0]
    );
  }
}

function addRecurring(desc, amt, type, cat, date) {
  const start = new Date(date);

  for (let i = 0; i < 12; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);

    addTransaction(
      `${desc} (recorrente)`,
      amt,
      type,
      cat,
      d.toISOString().split("T")[0]
    );
  }
}

/*********************************
 * TABELA
 *********************************/
function renderTransactions() {
  transactionTableBody.innerHTML = "";

  state.transactions.forEach(tx => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.description}</td>
      <td>${getCategoryName(tx.category)}</td>
      <td>${tx.type === "income" ? "Receita" : "Despesa"}</td>
      <td>${formatCurrency(tx.amount)}</td>
      <td>
        <button class="action-btn edit" onclick="editTransaction('${tx.id}')">Editar</button>
        <button class="action-btn delete" onclick="deleteTransaction('${tx.id}')">Excluir</button>
      </td>
    `;

    transactionTableBody.appendChild(tr);
  });
}

function editTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  editingId = id;

  document.getElementById("description").value = tx.description;
  document.getElementById("amount").value = tx.amount;
  document.getElementById("type").value = tx.type;
  document.getElementById("categorySelect").value = tx.category;
  document.getElementById("date").value = tx.date;

  document.getElementById("installments").value = 1;
  document.getElementById("isRecurring").checked = false;

  transactionForm.querySelector("button").textContent = "Salvar edição";
}


function deleteTransaction(id) {
  state.transactions = state.transactions.filter(tx => tx.id !== id);
  saveStorage();
  renderAll();
}

function getCategoryName(id) {
  const cat = state.categories.find(c => c.id === id);
  return cat ? cat.name : "-";
}

/*********************************
 * VISÃO GERAL
 *********************************/
function renderOverview() {
  let income = 0;
  let expense = 0;

  state.transactions.forEach(tx => {
    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
  });

  document.getElementById("totalIncome").textContent = formatCurrency(income);
  document.getElementById("totalExpense").textContent = formatCurrency(expense);
  document.getElementById("totalBalance").textContent = formatCurrency(income - expense);
}

/*********************************
 * GRÁFICOS
 *********************************/
let categoryChart;
let monthlyChart;

function renderCharts() {
  renderCategoryChart();
  renderMonthlyChart();
}

function renderCategoryChart() {
  const dataMap = {};

  state.transactions
    .filter(tx => tx.type === "expense")
    .forEach(tx => {
      const name = getCategoryName(tx.category);
      dataMap[name] = (dataMap[name] || 0) + tx.amount;
    });

  const ctx = document.getElementById("categoryChart").getContext("2d");

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(dataMap),
      datasets: [{
        data: Object.values(dataMap)
      }]
    }
  });
}

function renderMonthlyChart() {
  const months = Array(12).fill(0);

  state.transactions.forEach(tx => {
    const m = new Date(tx.date).getMonth();
    months[m] += tx.type === "income" ? tx.amount : -tx.amount;
  });

  const ctx = document.getElementById("monthlyChart").getContext("2d");

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Jan","Fev","Mar","Abr","Mai","Jun",
        "Jul","Ago","Set","Out","Nov","Dez"
      ],
      datasets: [{
        label: "Saldo Mensal",
        data: months
      }]
    }
  });
}


/*********************************
 * RENDER GERAL
 *********************************/
function renderAll() {
  renderCategories();
  renderTransactions();
  renderOverview();
  renderCharts();
}

document.getElementById("exportBackup").addEventListener("click", () => {
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "controle-financeiro-backup.json";
  a.click();

  URL.revokeObjectURL(url);
});

document.getElementById("importBackup").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const importedState = JSON.parse(event.target.result);

      if (!importedState.categories || !importedState.transactions) {
        alert("Arquivo inválido");
        return;
      }

      state = importedState;
      saveStorage();
      renderAll();

      alert("Backup restaurado com sucesso!");
    } catch {
      alert("Erro ao importar backup");
    }
  };

  reader.readAsText(file);
});


/*********************************
 * INIT
 *********************************/
loadStorage();
applyDarkMode();
renderAll();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
