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
// FILTRO
// ===============================
let anoSelecionado = new Date().getFullYear();

// ===============================
// GRÁFICOS
// ===============================
let graficoCategorias = null;
let graficoResumo = null;

// ===============================
// DOM
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

const filtroAno = document.getElementById("filtro-ano");

// ===============================
// UTIL
// ===============================
function salvarDados() {
    localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
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
    selectCategoria.innerHTML = "";
    categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        selectCategoria.appendChild(option);
    });

    listaCategorias.innerHTML = "";
    categorias.forEach((cat, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${cat} <button onclick="removerCategoria(${index})">❌</button>`;
        listaCategorias.appendChild(li);
    });
}

function removerCategoria(index) {
    const categoria = categorias[index];
    const emUso = lancamentos.some(l => l.categoria === categoria);
    if (emUso) {
        alert("Categoria em uso.");
        return;
    }
    categorias.splice(index, 1);
    salvarDados();
    renderizarCategorias();
}

// ===============================
// FILTRO POR ANO
// ===============================
function obterLancamentosFiltrados() {
    return lancamentos.filter(l => {
        const ano = new Date(l.data).getFullYear();
        return ano === anoSelecionado;
    });
}

function preencherFiltroAno() {
    const anos = [...new Set(lancamentos.map(l => new Date(l.data).getFullYear()))];
    filtroAno.innerHTML = "";

    anos.sort().forEach(ano => {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        filtroAno.appendChild(option);
    });

    filtroAno.value = anoSelecionado;
}

// ===============================
// RESUMO
// ===============================
function calcularResumo() {
    let receitas = 0;
    let despesas = 0;

    obterLancamentosFiltrados().forEach(l => {
        l.tipo === "receita" ? receitas += l.valor : despesas += l.valor;
    });

    const saldo = receitas - despesas;

    totalReceitasEl.textContent = formatarMoeda(receitas);
    totalDespesasEl.textContent = formatarMoeda(despesas);
    saldoTotalEl.textContent = formatarMoeda(saldo);
    saldoTotalEl.style.color = saldo >= 0 ? "#27ae60" : "#eb5757";
}

// ===============================
// TABELA
// ===============================
function renderizarLancamentos() {
    listaLancamentos.innerHTML = "";

    obterLancamentosFiltrados().forEach((l, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="${l.tipo === "receita" ? "tipo-receita" : "tipo-despesa"}">${l.tipo}</td>
            <td>${l.descricao}</td>
            <td>${l.categoria}</td>
            <td>${formatarMoeda(l.valor)}</td>
            <td>${l.data}</td>
            <td><button onclick="removerLancamento(${index})">❌</button></td>
        `;
        listaLancamentos.appendChild(tr);
    });

    calcularResumo();
    atualizarGraficoCategorias();
    atualizarGraficoResumo();
}

// ===============================
// PARCELAMENTO
// ===============================
function gerarParcelas({ tipo, descricao, categoria, valor, data, parcelas }) {
    const valorParcela = valor / parcelas;
    const dataBase = new Date(data);

    for (let i = 0; i < parcelas; i++) {
        const novaData = new Date(dataBase);
        novaData.setMonth(dataBase.getMonth() + i);

        lancamentos.push({
            tipo,
            descricao: `${descricao} (${i + 1}/${parcelas})`,
            categoria,
            valor: valorParcela,
            data: novaData.toISOString().split("T")[0]
        });
    }
}

// ===============================
// GRÁFICOS
// ===============================
function atualizarGraficoCategorias() {
    const ctx = document.getElementById("grafico-categorias").getContext("2d");

    const dados = {};
    obterLancamentosFiltrados().forEach(l => {
        if (l.tipo === "despesa") {
            dados[l.categoria] = (dados[l.categoria] || 0) + l.valor;
        }
    });

    if (graficoCategorias) graficoCategorias.destroy();

    graficoCategorias = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(dados),
            datasets: [{ data: Object.values(dados) }]
        },
        options: { responsive: true }
    });
}

function atualizarGraficoResumo() {
    const ctx = document.getElementById("grafico-mensal").getContext("2d");

    let receitas = 0, despesas = 0;
    obterLancamentosFiltrados().forEach(l => {
        l.tipo === "receita" ? receitas += l.valor : despesas += l.valor;
    });

    if (graficoResumo) graficoResumo.destroy();

    graficoResumo = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Receitas", "Despesas"],
            datasets: [{ data: [receitas, despesas] }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// ===============================
// EVENTOS
// ===============================
formLancamento.addEventListener("submit", e => {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value;
    const categoria = selectCategoria.value;
    const valor = Number(document.getElementById("valor").value);
    const data = document.getElementById("data").value;
    const parcelas = Number(document.getElementById("parcelas")?.value || 1);

    if (parcelas > 1) {
        gerarParcelas({ tipo, descricao, categoria, valor, data, parcelas });
    } else {
        lancamentos.push({ tipo, descricao, categoria, valor, data });
    }

    salvarDados();
    preencherFiltroAno();
    renderizarLancamentos();
    formLancamento.reset();
});

formCategoria.addEventListener("submit", e => {
    e.preventDefault();
    const nova = inputNovaCategoria.value.trim();
    if (!nova || categorias.includes(nova)) return;
    categorias.push(nova);
    salvarDados();
    renderizarCategorias();
    inputNovaCategoria.value = "";
});

filtroAno.addEventListener("change", () => {
    anoSelecionado = Number(filtroAno.value);
    renderizarLancamentos();
});

// ===============================
// INIT
// ===============================
renderizarCategorias();
preencherFiltroAno();
renderizarLancamentos();
