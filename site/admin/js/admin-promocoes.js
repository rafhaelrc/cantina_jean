const API_URL = 'https://cantina-api-rlqm.onrender.com/api/admin';

const AUTH_HEADER = {
    'Authorization': 'Basic ' + btoa('admin:123'),
    'Content-Type': 'application/json'
};

let produtos = {};        // { [id]: produto }
let promocoes = {};       // começa vazio
let proximoIdPromocao = 0;

const tabela = document.getElementById('bodyTabela');

// Lista com checkbox
const listaCheckbox = document.getElementById('listaProdutosCheckbox');
const pesquisarProduto = document.getElementById('pesquisarProduto');
const semResultado = document.getElementById('semResultado');

// =====================================================
// DATAS / TEMPO (Controle de início/fim das promoções)
// =====================================================

/**
 * Converte o valor de um input datetime-local para Date.
 * datetime-local vem no formato "YYYY-MM-DDTHH:mm" (sem timezone).
 * @param {string} valor - valor do input.
 * @returns {Date|null} Date válida ou null se vazio/inválido.
 */
function converterDatetimeLocalParaDate(valor) {
    if (!valor) return null;
    const data = new Date(valor);
    if (isNaN(data.getTime())) return null;
    return data;
}

/**
 * Converte um Date em string no formato aceito pelo input datetime-local.
 * Ex: "2026-02-24T14:30"
 * @param {Date} data
 * @returns {string}
 */
function converterDateParaDatetimeLocal(data) {
    const pad2 = (n) => String(n).padStart(2, '0');
    const ano = data.getFullYear();
    const mes = pad2(data.getMonth() + 1);
    const dia = pad2(data.getDate());
    const hora = pad2(data.getHours());
    const min = pad2(data.getMinutes());
    return `${ano}-${mes}-${dia}T${hora}:${min}`;
}

/**
 * Formata uma data para exibição (pt-BR) com dia/mês/ano e hora:minuto.
 * @param {string|Date} data
 * @returns {string}
 */
function formatarDataHoraPtBR(data) {
    const d = (data instanceof Date) ? data : new Date(data);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Retorna um status temporal baseado em inicio/fim.
 * @param {object} promocao - Precisa ter inicioEm e fimEm.
 * @returns {"AGENDADA"|"ATIVA"|"EXPIRADA"}
 */
function obterStatusTemporalPromocao(promocao) {
    const agora = new Date();
    const inicio = new Date(promocao.inicioEm);
    const fim = new Date(promocao.fimEm);

    if (agora < inicio) return "AGENDADA";
    if (agora > fim) return "EXPIRADA";
    return "ATIVA";
}

// ==============================
// LISTA DE PRODUTOS (CHECKBOX)
// ==============================

function renderListaProdutosCheckbox(filtroTexto = "") {
    const termo = (filtroTexto || "").toLowerCase().trim();

    // Limpa a lista
    listaCheckbox.innerHTML = "";

    let encontrou = false;

    Object.values(produtos).forEach((p) => {
        const nome = (p.nome || "").toLowerCase();

        // filtro
        if (termo && !nome.includes(termo)) return;

        encontrou = true;

        const label = document.createElement("label");
        label.className = "item-produto-checkbox";

        if (!p.ativo) {
            label.classList.add("produtoInativoLabel");
        }

        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = String(p.id);
        input.className = "chkProduto";

        const span = document.createElement("span");
        span.textContent = p.nome;

        label.appendChild(input);
        label.appendChild(span);

        listaCheckbox.appendChild(label);
    });

    semResultado.style.display = (!encontrou && termo) ? "" : "none";
}

function ResetarListaProdutosCheckbox() {
    const checks = listaCheckbox.querySelectorAll("input.chkProduto");
    checks.forEach(chk => chk.checked = false);
}

function ObterProdutosSelecionadosCheckbox() {
    const checksMarcados = listaCheckbox.querySelectorAll("input.chkProduto:checked");
    return Array.from(checksMarcados).map(chk => parseInt(chk.value, 10));
}

function SelecionarProdutosCheckbox(ids) {
    const setIds = new Set((ids || []).map(n => parseInt(n, 10)));
    const checks = listaCheckbox.querySelectorAll("input.chkProduto");
    checks.forEach(chk => {
        const id = parseInt(chk.value, 10);
        chk.checked = setIds.has(id);
    });
}

// Busca (somente UM listener)
pesquisarProduto.addEventListener("input", function () {
    renderListaProdutosCheckbox(this.value);
});

// ==============================
// IMAGEM
// ==============================

document.getElementById('enviarFoto').addEventListener('change', function (event) {
    const arquivo = event.target.files[0];
    const apresentador = document.getElementById('imgCadastrada');

    if (!arquivo || !arquivo.type.startsWith('image/')) {
        alert('Selecione um arquivo de imagem válido.');
        event.target.value = '';
        return;
    }

    // OBS: isso só mostra o nome/placeholder. Para preview real, precisaria FileReader/URL.createObjectURL
    apresentador.src = arquivo.name;
});

// ==============================
// POPUPS / AÇÕES
// ==============================

function Cadastrar() {
    const id = document.getElementById('idVisualizado');
    const nome = document.getElementById('nome');
    const descricao = document.getElementById('descricao');
    const disponibilidade = document.getElementById('disponibilidade');
    const preco = document.getElementById('preco');
    const imgCadastrada = document.getElementById('imgCadastrada');
    const titulo = document.getElementById('tituloVerificar');

    // Inputs de data/hora (novo modelo)
    const inicioInput = document.getElementById('inicioEm');
    const fimInput = document.getElementById('fimEm');

    id.value = proximoIdPromocao;
    nome.value = '';
    descricao.value = '';
    disponibilidade.value = 1;
    preco.value = 0;
    imgCadastrada.src = '../imgs/foto-padrao-promocao.svg';
    titulo.innerText = 'Cadastrar nova promoção';

    // Datas padrão: início agora e fim 1 hora depois (admin pode alterar)
    const agora = new Date();
    const fimPadrao = new Date(agora.getTime() + (60 * 60 * 1000));

    if (inicioInput) inicioInput.value = converterDateParaDatetimeLocal(agora);
    if (fimInput) fimInput.value = converterDateParaDatetimeLocal(fimPadrao);

    // reset seleção + reset busca
    ResetarListaProdutosCheckbox();
    pesquisarProduto.value = "";
    renderListaProdutosCheckbox("");

    window.location.assign("#popupVerificar");
}

function Visualizar(num) {
    const nome = document.getElementById('labelNome');
    const descricao = document.getElementById('labelDescricao');
    const disponibilidade = document.getElementById('labelDisponibilidade');
    const preco = document.getElementById('labelPreco');
    const imgCadastrada = document.getElementById('visualizarImgCadastrada');
    const titulo = document.getElementById('tituloVisualizar');
    const produtos_lista = document.getElementById('labelListaProdutos');

    // Labels novos (se existirem no HTML)
    const labelInicioEm = document.getElementById('labelInicioEm');
    const labelFimEm = document.getElementById('labelFimEm');
    const labelValidade = document.getElementById('labelValidade'); // se você ainda tiver no HTML

    if (!promocoes[num]) return;

    nome.innerText = promocoes[num].nome;
    descricao.innerText = promocoes[num].descricao;
    disponibilidade.innerText = promocoes[num].status ? "Ativo" : "Inativo";
    preco.innerText = promocoes[num].preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    imgCadastrada.src = promocoes[num].foto;
    titulo.innerText = `Visualização da promoção ${promocoes[num].nome}`;

    // Se você ainda tiver "Validade" no visualizador, agora ela fica apenas informativa.
    // Vamos calcular automaticamente (diferença entre fim e início) e mostrar.
    if (labelValidade && promocoes[num].inicioEm && promocoes[num].fimEm) {
        const inicio = new Date(promocoes[num].inicioEm);
        const fim = new Date(promocoes[num].fimEm);
        const diffHoras = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        labelValidade.innerText = isNaN(diffHoras) ? "-" : diffHoras.toFixed(2);
    }

    // Mostra início/fim (se labels existirem)
    if (labelInicioEm) labelInicioEm.innerText = formatarDataHoraPtBR(promocoes[num].inicioEm);
    if (labelFimEm) labelFimEm.innerText = formatarDataHoraPtBR(promocoes[num].fimEm);

    let produtos_html = '';
    promocoes[num].produtos_lista.forEach((produtoId) => {
        if (produtos[produtoId]) {
            produtos_html += `<p class="itensListados">${produtos[produtoId].nome}</p>`;
        }
    });
    produtos_lista.innerHTML = produtos_html;

    window.location.assign("#popupVisualizar");
}

function Editar(num) {
    const id = document.getElementById('idVisualizado');
    const nome = document.getElementById('nome');
    const descricao = document.getElementById('descricao');
    const disponibilidade = document.getElementById('disponibilidade');
    const preco = document.getElementById('preco');
    const imgCadastrada = document.getElementById('imgCadastrada');
    const titulo = document.getElementById('tituloVerificar');

    // Inputs de data/hora (novo modelo)
    const inicioInput = document.getElementById('inicioEm');
    const fimInput = document.getElementById('fimEm');

    if (!promocoes[num]) return;

    id.value = num;
    nome.value = promocoes[num].nome;
    descricao.value = promocoes[num].descricao;
    disponibilidade.value = promocoes[num].status;
    preco.value = promocoes[num].preco;
    imgCadastrada.src = promocoes[num].foto;
    titulo.innerText = `Edição da promoção ${promocoes[num].nome}`;

    // Preenche início/fim no formulário
    if (inicioInput && promocoes[num].inicioEm) {
        inicioInput.value = converterDateParaDatetimeLocal(new Date(promocoes[num].inicioEm));
    }
    if (fimInput && promocoes[num].fimEm) {
        fimInput.value = converterDateParaDatetimeLocal(new Date(promocoes[num].fimEm));
    }

    // reset + selecionar
    ResetarListaProdutosCheckbox();
    pesquisarProduto.value = "";
    renderListaProdutosCheckbox("");

    SelecionarProdutosCheckbox(promocoes[num].produtos_lista);

    window.location.assign("#popupVerificar");
}

function Excluir(num) {
    if (!promocoes[num]) return;

    if (confirm("Tem certeza que deseja excluir essa promoção?")) {
        delete promocoes[num];
        const linha = document.getElementById('idLinha' + num);
        if (linha) linha.remove();
    }
}

function Salvar() {
    const num = document.getElementById('idVisualizado');
    const nome = document.getElementById('nome');
    const descricao = document.getElementById('descricao');
    const disponibilidade = document.getElementById('disponibilidade');
    const preco = document.getElementById('preco');
    const imgCadastrada = document.getElementById('imgCadastrada');

    // Inputs de data/hora (novo modelo)
    const inicioInput = document.getElementById('inicioEm');
    const fimInput = document.getElementById('fimEm');

    const produtosSelecionados = ObterProdutosSelecionadosCheckbox();

    // Calcula preço máximo com base na soma dos produtos selecionados
    let preco_maximo = 0;
    produtosSelecionados.forEach((idProduto) => {
        if (produtos[idProduto]) {
            preco_maximo += parseFloat(produtos[idProduto].preco);
        }
    });

    // Validação: precisa ter pelo menos 1 produto
    if (!produtosSelecionados.length) {
        alert('Nenhum produto selecionado para a promoção, selecione um produto antes de salvar.');
        return;
    }

    // Validação: preço da promoção não pode ser maior que a soma dos produtos
    if (parseFloat(preco.value) > preco_maximo) {
        alert(`O preço escolhido é maior que a soma dos valores dos produtos da promoção (R$ ${parseFloat(preco_maximo)}).`);
        return;
    }

    // ==============================
    // DATAS / TEMPO (controle manual)
    // ==============================

    // Lê o início e fim definidos pelo admin
    const inicioDate = converterDatetimeLocalParaDate(inicioInput ? inicioInput.value : "");
    const fimDate = converterDatetimeLocalParaDate(fimInput ? fimInput.value : "");

    // Validação: início e fim obrigatórios
    if (!inicioDate || !fimDate) {
        alert("Preencha a data/hora de Início e a data/hora de Fim.");
        return;
    }

    // Validação: fim precisa ser maior que início
    if (fimDate.getTime() <= inicioDate.getTime()) {
        alert("A data/hora de Fim precisa ser maior que a data/hora de Início.");
        return;
    }

    // Calcula validade (apenas informativa, já que você pediu para remover o campo de validade do controle)
    const validadeHoras = (fimDate.getTime() - inicioDate.getTime()) / (1000 * 60 * 60);

    // Salva a promoção com início e fim em ISO
    promocoes[parseInt(num.value, 10)] = {
        id: parseInt(num.value, 10),
        nome: nome.value,
        descricao: descricao.value,
        foto: imgCadastrada.src,
        status: parseInt(disponibilidade.value, 10),
        preco: parseFloat(preco.value),
        produtos_lista: produtosSelecionados,

        // Campo opcional/informativo (mantido para você usar no visualizador, se quiser)
        validade: validadeHoras,

        inicioEm: inicioDate.toISOString(),
        fimEm: fimDate.toISOString(),
    };

    if (parseInt(num.value, 10) === proximoIdPromocao) {
        proximoIdPromocao++;
    }

    window.location.assign("#");
    AtualizarTabela();
}

// ==============================
// TABELA
// ==============================

/**
 * Monta o texto e a cor do status mostrado na tabela,
 * combinando o "status" manual (ativo/inativo) com o tempo (inicio/fim).
 * @param {object} promocao
 * @returns {{texto: string, cor: string, tooltip: string}}
 */
function obterStatusParaTabela(promocao) {
    // Se o admin marcou como inativo, sempre inativo
    if (!promocao.status) {
        return {
            texto: "Inativa",
            cor: "#ffd600", // amarelo (mesmo padrão do seu CSS/JS antigo)
            tooltip: "Promoção desativada pelo admin."
        };
    }

    // Se estiver ativo, avalia pelo tempo
    const statusTemporal = obterStatusTemporalPromocao(promocao);

    if (statusTemporal === "AGENDADA") {
        return {
            texto: "Agendada",
            cor: "#00a1ff", // azul
            tooltip: `Começa em: ${formatarDataHoraPtBR(promocao.inicioEm)}\nTermina em: ${formatarDataHoraPtBR(promocao.fimEm)}`
        };
    }

    if (statusTemporal === "EXPIRADA") {
        return {
            texto: "Expirada",
            cor: "#ff0000", // vermelho
            tooltip: `Começou em: ${formatarDataHoraPtBR(promocao.inicioEm)}\nTerminou em: ${formatarDataHoraPtBR(promocao.fimEm)}`
        };
    }

    // ATIVA
    return {
        texto: "Ativa",
        cor: "var(--verde-secundario)",
        tooltip: `Começou em: ${formatarDataHoraPtBR(promocao.inicioEm)}\nTermina em: ${formatarDataHoraPtBR(promocao.fimEm)}`
    };
}

function AtualizarTabela() {
    tabela.innerHTML = "";

    for (let id in promocoes) {
        const promocao = promocoes[id];

        // Lista de produtos exibida na tabela
        let produtos_html = "";
        promocao.produtos_lista.forEach((produtoId) => {
            if (produtos[produtoId]) {
                produtos_html += `<p>${produtos[produtoId].nome}</p>`;
            }
        });

        // Status automático (manual + tempo)
        const statusTabela = obterStatusParaTabela(promocao);

        tabela.innerHTML += `
      <tr id="idLinha${id}">
        <td>${promocao.nome}</td>
        <td>${promocao.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        <td>${produtos_html}</td>
        <td class="areaStatus">
          <span title="${statusTabela.tooltip.replaceAll('"', '&quot;')}"
                style="background-color: ${statusTabela.cor};">
            ${statusTabela.texto}
          </span>
        </td>
        <td>
          <button onclick="Visualizar(${id})">👁</button>
          <button onclick="Editar(${id})">✏</button>
          <button onclick="Excluir(${id})">🗑</button>
        </td>
      </tr>
    `;
    }
}

// ==============================
// API: PRODUTOS
// ==============================

async function ListarProdutos() {
    produtos = {};

    // feedback visual simples (opcional)
    listaCheckbox.innerHTML = `<div style="padding:8px;">A carregar ...</div>`;
    semResultado.style.display = "none";

    const resposta = await fetch(API_URL + "/produtos", {
        method: "GET",
        headers: AUTH_HEADER
    });

    if (!resposta.ok) {
        listaCheckbox.innerHTML = `<div style="padding:8px;">Erro ao carregar produtos (HTTP ${resposta.status})</div>`;
        return;
    }

    const dados = await resposta.json();

    dados.forEach((dado) => {
        produtos[dado.id] = dado;
    });

    renderListaProdutosCheckbox("");
}

// ==============================
// INIT
// ==============================

window.addEventListener("DOMContentLoaded", async () => {
    await ListarProdutos();
    AtualizarTabela();
});

// Atualiza a tabela de tempos em tempos para refletir expiração/agendamento automaticamente
setInterval(() => {
    AtualizarTabela();
}, 30000); // a cada 30s