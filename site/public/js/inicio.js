/* ================================================ */
/*                   inicio.js                      */
/* Lógica exclusiva da página inicial               */
/* controle das setas do carrossel                  */
/* renderização dos produtos em oferta              */
/* ================================================ */

/* ================================================ */
/* CONFIGURAÇÕES GLOBAIS (API e funções auxiliares) */
/* ================================================ */

// Função auxiliar para caminho de imagem (usada na renderização)
function obterCaminhoImagem(nomeArquivo) {
  if (!nomeArquivo) return 'img/default.png';
  if (nomeArquivo.startsWith('http')) return nomeArquivo;
  if (nomeArquivo.startsWith('img/')) return nomeArquivo;
  return `img/${nomeArquivo}`;
}

/* ============================================= */
/*               CONTROLE DO CARROSSEL           */
/* ============================================= */
const track = document.querySelector('.carrossel-track');
const btnEsq = document.querySelector('.esquerda');
const btnDir = document.querySelector('.direita');

let scroll = 0;

btnDir.addEventListener('click', () => {
  scroll += 160;
  track.scrollTo({ left: scroll, behavior: 'smooth' });
});

btnEsq.addEventListener('click', () => {
  scroll -= 160;
  if (scroll < 0) scroll = 0;
  track.scrollTo({ left: scroll, behavior: 'smooth' });
});

/* ============================================= */
/*        RENDERIZA OS PRODUTOS EM OFERTA        */
/* ============================================= */
function renderizarCarrossel(produtos) {
  const trackCarrossel = document.querySelector('.carrossel-track');
  if (!trackCarrossel) return;

  trackCarrossel.innerHTML = '';

  produtos.forEach(prod => {
    const caminhoImg = obterCaminhoImagem(prod.imagemUrl);

    if (prod.promocao === true || prod.preco < 10) {
      const htmlOferta = `
            <div class="item">
              <img 
                  src="${caminhoImg}" 
                  alt="${prod.nome}" 
                  onerror="this.onerror=null; this.src='img/default.png';"
              >
              
              <div class="legenda-item">${prod.nome}</div>
              
              <button class="btn-carrinho" onclick="adicionarAoCarrinho(${prod.id}, '${prod.nome.replace(/'/g, "\\'")}', ${prod.preco})">
                <img src="img/carrinho.png">
              </button>
            </div>
          `;
      trackCarrossel.innerHTML += htmlOferta;
    }
  });
}

// ================================================
// CARREGA OS PRODUTOS DA API E MOSTRA NO CARROSSEL
// (exatamente como estava no código original)
// ================================================
async function carregarProdutosParaInicio() {
  try {
    const resposta = await fetch(`${API_BASE}/api/public/produtos`);
    const dados = await resposta.json();

    // Salva globalmente se precisar usar em outros lugares depois
    // produtosGlobais = dados;   ← opcional, pode comentar se não usar

    // Chama a função que já existe para preencher o carrossel
    renderizarCarrossel(dados);

  } catch (erro) {
    console.error("Erro ao carregar produtos para o carrossel:", erro);
  }
}

// Executa automaticamente quando a página inicial carrega
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutosParaInicio();
});