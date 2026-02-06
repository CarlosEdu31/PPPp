// ===============================
// STORAGE
// ===============================
let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];

let categorias = JSON.parse(localStorage.getItem("categorias")) || [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Lazer",
    "Outros"
];

// ===============================
// ELEMENTOS DO DOM
// ===============================
const formLancamento = document.getElementById("form-lancamento");
const listaLancamentos = document.getElementById("lista-lancamentos");

const totalReceitasEl = document.getElementById("total-receitas");
const totalDespesasEl = document.getElementById("total-despesas");
const saldoTotalEl = document.getElementById("saldo-total");

const selectCategoria = document.getElementById("categoria");

const formCategoria = document.getElementById("form-categoria");
const inputNovaCategoria = document.getElementById("nova-categoria");
const listaCategorias = document.getElementById("lista-categorias");

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function salvarLancamentos() {
    localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
}

function salvarCategorias() {
    localStorage.setItem("categorias", JSON.stringify(categorias));
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ===============================
// CATEGORIAS
// ===============================
function renderizarCategorias() {
    // Select
    selectCategoria.innerHTML = "";
    categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
    });

    // Lista de gerenciamento
    listaCategorias.innerHTML = "";
    categorias.forEach((cat, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${cat}
            <button onclick="removerCategoria(${index})">❌</button>
        `;
        listaCategorias.appendChild(li);
    });
}

function removerCategoria(index) {
    const categoria = categorias[index];

    const emUso = lancamentos.some(l => l.categoria === categoria);
    if (emUso) {
        alert("Essa categoria está sendo usada em lançamentos.");
        return;
    }

    categorias.splice(index, 1);
    salvarCategorias();
    renderizarCategorias();
}

// ===============================
// LANÇAMENTOS
// ===============================
function calcularResumo() {
    let receitas = 0;
    let despesas = 0;

    lancamentos.forEach(l => {
        if (l.tipo === "receita") {
            receitas += l.valor;
        } else {
            despesas += l.valor;
        }
    });

    const saldo = receitas - despesas;

    totalReceitasEl.textContent = formatarMoeda(receitas);
    totalDespesasEl.textContent = formatarMoeda(despesas);
    saldoTotalEl.textContent = formatarMoeda(saldo);

    saldoTotalEl.style.color = saldo >= 0 ? "#27ae60" : "#eb5757";
}

function renderizarLancamentos() {
    listaLancamentos.innerHTML = "";

    lancamentos.forEach((l, index) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td class="${l.tipo === "receita" ? "tipo-receita" : "tipo-despesa"}">
                ${l.tipo}
            </td>
            <td>${l.descricao}</td>
            <td>${l.categoria}</td>
            <td>${formatarMoeda(l.valor)}</td>
            <td>${l.data}</td>
            <td>
                <button onclick="removerLancamento(${index})">❌</button>
            </td>
        `;

        listaLancamentos.appendChild(tr);
    });

    calcularResumo();
}

function removerLancamento(index) {
    lancamentos.splice(index, 1);
    salvarLancamentos();
    renderizarLancamentos();
}

// ===============================
// EVENTOS
// ===============================
formLancamento.addEventListener("submit", function (e) {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value.trim();
    const categoria = selectCategoria.value;
    const valor = Number(document.getElementById("valor").value);
    const data = document.getElementById("data").value;

    if (!descricao || valor <= 0 || !data) {
        alert("Preencha todos os campos corretamente.");
        return;
    }

    lancamentos.push({
        tipo,
        descricao,
        categoria,
        valor,
        data
    });

    salvarLancamentos();
    renderizarLancamentos();
    formLancamento.reset();
});

formCategoria.addEventListener("submit", function (e) {
    e.preventDefault();

    const novaCategoria = inputNovaCategoria.value.trim();

    if (!novaCategoria) return;

    if (categorias.includes(novaCategoria)) {
        alert("Categoria já existe.");
        return;
    }

    categorias.push(novaCategoria);
    salvarCategorias();
    renderizarCategorias();
    inputNovaCategoria.value = "";
});

// ===============================
// INICIALIZAÇÃO
// ===============================
renderizarCategorias();
renderizarLancamentos();
