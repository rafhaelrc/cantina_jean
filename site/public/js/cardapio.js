/*
 *---------- Algumas informações --------:
 * onde há # deve-se ser revisado e talvez reajustado
 *
 * Os produtos vêm do banco de dados através da API, usando um endpoint
 * público com método GET (para leitura).
 * O front consome esses dados e monta o HTML dinamicamente com JavaScript.
 */

/* ================================================ */
/*                 cardapio.js                      */
/* Lógica exclusiva da página Cardápio              */
/* - Carrega produtos da API                        */
/* - Renderiza acordeão por categorias              */
/* - Expansão/colapso das seções                    */
/* - Pesquisa/filtro ao digitar                     */
/* ================================================ */

// ────────────────────────────────────────────────
// ESTADO GLOBAL NECESSÁRIO PARA O CARDÁPIO
// ────────────────────────────────────────────────
let produtosGlobais = [];

// ────────────────────────────────────────────────
// FUNÇÃO AUXILIAR – CAMINHO DAS IMAGENS
// ────────────────────────────────────────────────
function obterCaminhoImagem(nomeArquivo) {
    if (!nomeArquivo) return 'img/default.png';
    if (nomeArquivo.startsWith('http')) return nomeArquivo;
    if (nomeArquivo.startsWith('img/')) return nomeArquivo;
    return `img/${nomeArquivo}`;
}

// ────────────────────────────────────────────────
// CARDÁPIO – MENU EXPANSÍVEL (ACORDEÃO)
// ────────────────────────────────────────────────
function toggleSection(id) {
    const section = document.getElementById(id);
    section.classList.toggle('escondido');

    const bar = section.previousElementSibling;
    const arrow = bar.querySelector('.menu-arrow');

    arrow.textContent = section.classList.contains('escondido') ? '▼' : '▲';
}

// ────────────────────────────────────────────────
// RENDERIZA O CARDÁPIO COMPLETO (ACORDEÃO POR CATEGORIAS)
// ────────────────────────────────────────────────
function renderizarCardapioCompleto(produtos) {
    const menu = document.getElementById("menu-categorias");
    if (!menu) return;

    menu.innerHTML = "";
    const categorias = {};

    // Agrupa os produtos por categoria
    produtos.forEach(prod => {
        const nomeCategoria = prod.categoria ? prod.categoria.nome : "Outros";
        const idCategoria = nomeCategoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

        if (!categorias[idCategoria]) {
            categorias[idCategoria] = { nome: nomeCategoria, produtos: [] };
        }
        categorias[idCategoria].produtos.push(prod);
    });

    // Cria as barras expansíveis e os itens dentro
    Object.entries(categorias).forEach(([idCategoria, categoria]) => {
        const barra = `
            <div class="menu-bar" onclick="toggleSection('${idCategoria}')">
                <span class="menu-title">${categoria.nome}</span>
                <span class="menu-arrow">▼</span>
            </div>
            <div id="${idCategoria}" class="menu-items escondido"></div>
        `;
        menu.innerHTML += barra;

        const containerItens = document.getElementById(idCategoria);

        categoria.produtos.forEach(prod => {
            const caminhoImg = obterCaminhoImagem(prod.imagemUrl);

            containerItens.innerHTML += `
                <div class="itemcardapio">
                    <img src="${caminhoImg}" alt="${prod.nome}" onerror="this.src='img/default.png'">
                    <div class="itemcardapio-texto">
                        <h3>${prod.nome}</h3>
                        <p>${prod.descricao || ""}</p>
                        <p class="preco">R$ ${prod.preco.toFixed(2)}</p>
                    </div>
                    <button class="botao-adicionar"
                        onclick="adicionarAoCarrinho(${prod.id}, '${prod.nome.replace(/'/g, "\\'")}', ${prod.preco})">
                        <img src="img/carrinho.png">
                    </button>
                </div>
            `;
        });
    });
}

// ────────────────────────────────────────────────
// BUSCA OS PRODUTOS DA API E CHAMA A RENDERIZAÇÃO
// ────────────────────────────────────────────────
async function carregarProdutosCardapio() {
    try {
        document.getElementById("loading").style.display = "block";
        const resposta = await fetch(`${API_BASE}/api/public/produtos`);
        const dados = await resposta.json();

        produtosGlobais = dados; // Salva na global para a pesquisa funcionar

        // Renderiza apenas o cardápio (sem carrossel)
        renderizarCardapioCompleto(dados);
        document.getElementById("loading").style.display = "none";
    } catch (erro) {
        console.error("Erro ao carregar cardápio:", erro);
        document.getElementById("loading").innerHTML = '<p style="color:#c62828;">Não foi possível carregar o cardápio. Tente novamente.</p>';
    }
}

// ────────────────────────────────────────────────
// PESQUISA / FILTRO DE PRODUTOS (AO DIGITAR)
// ────────────────────────────────────────────────
const inputPesquisa = document.getElementById("pesquisa-produto");

inputPesquisa.addEventListener("input", () => {
    const termo = inputPesquisa.value.toLowerCase().trim();

    if (termo === "") {
        renderizarCardapioCompleto(produtosGlobais); // Volta ao normal
        return;
    }

    const filtrados = produtosGlobais.filter(prod =>
        prod.nome.toLowerCase().includes(termo) ||
        (prod.descricao && prod.descricao.toLowerCase().includes(termo)) ||
        (prod.categoria?.nome && prod.categoria.nome.toLowerCase().includes(termo))
    );
    renderizarCardapioCompleto(filtrados);
});

// ────────────────────────────────────────────────
// INICIA AO CARREGAR A PÁGINA DO CARDÁPIO
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", carregarProdutosCardapio);