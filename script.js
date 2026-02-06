// ================= DADOS =================
let categorias = [];
let lancamentos = [];

// ================= ELEMENTOS =================
const listaCategorias = document.getElementById("listaCategorias");
const categoriaSelect = document.getElementById("categoriaLancamento");
const filtroAno = document.getElementById("filtroAno");

const totalEntradasEl = document.getElementById("totalEntradas");
const totalSaidasEl = document.getElementById("totalSaidas");
const saldoFinalEl = document.getElementById("saldoFinal");

const listaLancamentos = document.getElementById("listaLancamentos");

// ================= CATEGORIAS =================
document
    .getElementById("btnAdicionarCategoria")
    .addEventListener("click", () => {
        const nome = document.getElementById("novaCategoria").value.trim();

        if (!nome) return alert("Digite uma categoria");

        categorias.push(nome);
        document.getElementById("novaCategoria").value = "";

        atualizarCategorias();
    });

function atualizarCategorias() {
    listaCategorias.innerHTML = "";
    categoriaSelect.innerHTML = "";

    categorias.forEach((cat) => {
        // Lista visual
        const li = document.createElement("li");
        li.textContent = cat;
        listaCategorias.appendChild(li);

        // Select de lançamento
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoriaSelect.appendChild(option);
    });
}

// ================= LANÇAMENTOS =================
document
    .getElementById("btnAdicionarLancamento")
    .addEventListener("click", () => {
        const descricao = document.getElementById("descricao").value;
        const valor = Number(document.getElementById("valor").value);
        const data = document.getElementById("data").value;
        const tipo = document.getElementById("tipo").value;
        const categoria = categoriaSelect.value;
        const parcelas = Number(document.getElementById("parcelas").value);

        if (!descricao || !valor || !data || !categoria) {
            return alert("Preencha todos os campos");
        }

        const valorParcela = valor / parcelas;
        const dataBase = new Date(data);

        for (let i = 0; i < parcelas; i++) {
            const novaData = new Date(dataBase);
            novaData.setMonth(dataBase.getMonth() + i);

            lancamentos.push({
                descricao: `${descricao} (${i + 1}/${parcelas})`,
                valor: valorParcela,
                data: novaData.toISOString().split("T")[0],
                tipo,
                categoria
            });
        }

        limparFormulario();
        atualizarLancamentos();
        atualizarResumo();
        atualizarFiltroAno();
    });

function limparFormulario() {
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("data").value = "";
    document.getElementById("parcelas").value = 1;
}

// ================= LISTA DE LANÇAMENTOS =================
function atualizarLancamentos() {
    listaLancamentos.innerHTML = "";

    const anoSelecionado = filtroAno.value;

    lancamentos
        .filter(l => l.data.startsWith(anoSelecionado))
        .forEach((l) => {
            const li = document.createElement("li");
            li.className =
                l.tipo === "entrada"
                    ? "lancamento-entrada"
                    : "lancamento-saida";

            li.innerHTML = `
                <strong>${l.descricao}</strong><br>
                ${l.categoria} | ${l.data}<br>
                R$ ${l.valor.toFixed(2)}
            `;

            listaLancamentos.appendChild(li);
        });
}

// ================= RESUMO =================
function atualizarResumo() {
    const anoSelecionado = filtroAno.value;

    let entradas = 0;
    let saidas = 0;

    lancamentos
        .filter(l => l.data.startsWith(anoSelecionado))
        .forEach((l) => {
            if (l.tipo === "entrada") entradas += l.valor;
            else saidas += l.valor;
        });

    totalEntradasEl.textContent = entradas.toFixed(2);
    totalSaidasEl.textContent = saidas.toFixed(2);
    saldoFinalEl.textContent = (entradas - saidas).toFixed(2);
}

// ================= FILTRO DE ANO =================
function atualizarFiltroAno() {
    const anos = [...new Set(lancamentos.map(l => l.data.substring(0, 4)))];

    filtroAno.innerHTML = "";

    anos.forEach((ano) => {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        filtroAno.appendChild(option);
    });

    filtroAno.value = anos[anos.length - 1];
}

filtroAno.addEventListener("change", () => {
    atualizarLancamentos();
    atualizarResumo();
});

// ================= INICIAL =================
const anoAtual = new Date().getFullYear();
const optionInicial = document.createElement("option");
optionInicial.value = anoAtual;
optionInicial.textContent = anoAtual;
filtroAno.appendChild(optionInicial);
