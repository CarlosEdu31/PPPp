document.addEventListener("DOMContentLoaded", () => {

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

  const btnCategoria = document.getElementById("btnAdicionarCategoria");
  const btnLancamento = document.getElementById("btnAdicionarLancamento");

  // ================= DEBUG VISUAL =================
  if (!btnLancamento || !btnCategoria) {
      alert("ERRO: botões não encontrados. Verifique os IDs no HTML.");
      return;
  }

  // ================= CATEGORIAS =================
  btnCategoria.addEventListener("click", () => {
      const input = document.getElementById("novaCategoria");
      const nome = input.value.trim();

      if (!nome) {
          alert("Digite uma categoria");
          return;
      }

      categorias.push(nome);
      input.value = "";

      atualizarCategorias();
  });

  function atualizarCategorias() {
      listaCategorias.innerHTML = "";
      categoriaSelect.innerHTML = "<option value=''>Selecione</option>";

      categorias.forEach(cat => {
          const li = document.createElement("li");
          li.textContent = cat;
          listaCategorias.appendChild(li);

          const option = document.createElement("option");
          option.value = cat;
          option.textContent = cat;
          categoriaSelect.appendChild(option);
      });
  }

  // ================= LANÇAMENTOS =================
  btnLancamento.addEventListener("click", () => {
      const descricao = document.getElementById("descricao").value.trim();
      const valor = Number(document.getElementById("valor").value);
      const data = document.getElementById("data").value;
      const tipo = document.getElementById("tipo").value;
      const categoria = categoriaSelect.value;
      const parcelas = Number(document.getElementById("parcelas").value);

      if (!descricao || !valor || !data || !categoria) {
          alert("Preencha todos os campos");
          return;
      }

      const valorParcela = valor / parcelas;
      const dataBase = new Date(data);

      for (let i = 0; i < parcelas; i++) {
          const d = new Date(dataBase);
          d.setMonth(dataBase.getMonth() + i);

          lancamentos.push({
              descricao: parcelas > 1 ? `${descricao} (${i + 1}/${parcelas})` : descricao,
              valor: valorParcela,
              data: d.toISOString().split("T")[0],
              tipo,
              categoria
          });
      }

      limparFormulario();
      atualizarFiltroAno();
      atualizarLancamentos();
      atualizarResumo();
  });

  function limparFormulario() {
      document.getElementById("descricao").value = "";
      document.getElementById("valor").value = "";
      document.getElementById("data").value = "";
      document.getElementById("parcelas").value = 1;
  }

  // ================= LISTA =================
  function atualizarLancamentos() {
      listaLancamentos.innerHTML = "";
      const ano = filtroAno.value;

      lancamentos
          .filter(l => l.data.startsWith(ano))
          .forEach(l => {
              const li = document.createElement("li");
              li.className = l.tipo === "entrada" ? "lancamento-entrada" : "lancamento-saida";
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
      const ano = filtroAno.value;
      let entradas = 0;
      let saidas = 0;

      lancamentos
          .filter(l => l.data.startsWith(ano))
          .forEach(l => {
              l.tipo === "entrada" ? entradas += l.valor : saidas += l.valor;
          });

      totalEntradasEl.textContent = entradas.toFixed(2);
      totalSaidasEl.textContent = saidas.toFixed(2);
      saldoFinalEl.textContent = (entradas - saidas).toFixed(2);
  }

  // ================= ANOS =================
  function atualizarFiltroAno() {
      const anos = [...new Set(lancamentos.map(l => l.data.substring(0, 4)))];
      filtroAno.innerHTML = "";

      anos.forEach(ano => {
          const op = document.createElement("option");
          op.value = ano;
          op.textContent = ano;
          filtroAno.appendChild(op);
      });

      filtroAno.value = anos[anos.length - 1];
  }

  filtroAno.addEventListener("change", () => {
      atualizarLancamentos();
      atualizarResumo();
  });

  // ================= INICIAL =================
  const anoAtual = new Date().getFullYear();
  filtroAno.innerHTML = `<option value="${anoAtual}">${anoAtual}</option>`;

});
