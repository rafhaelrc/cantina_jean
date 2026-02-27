/* ================================================ */
/*                   inicio.js                      */
/* Lógica exclusiva da página inicial               */
/* controle das setas do carrossel                  */
/* renderização dos produtos em oferta              */
/* ================================================ */

/* ============================================= */
/* CONTROLE DO CARROSSEL (setas esquerda/direita) */
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

/* ================================================ */
/* CARREGA OS PRODUTOS DA API E MOSTRA NO CARROSSEL */
/* ================================================ */
async function carregarProdutosParaInicio() {
  try {
    // Mostra o spinner de loading imediatamente (melhora experiência durante o delay da API)
    const loading = document.getElementById("loading-ofertas");
    if (loading) loading.style.display = "block";

    const resposta = await fetch(`${API_BASE}/api/public/produtos`);
    const dados = await resposta.json();

    // Chama a função que já existe para preencher o carrossel
    renderizarCarrossel(dados);

    // Esconde o loading assim que os itens aparecerem
    if (loading) loading.style.display = "none";

  } catch (erro) {
    console.error("Erro ao carregar produtos para o carrossel:", erro);
    
    // Se der erro, mostra mensagem no lugar do loading
    const loading = document.getElementById("loading-ofertas");
    if (loading) {
      loading.innerHTML = '<p style="color:#c62828; font-weight:bold;">Não foi possível carregar as ofertas. Tente novamente.</p>';
    }
  }
}

// Executa automaticamente quando a página inicial carrega
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutosParaInicio();
});

// ────────────────────────────────────────────────
// Função auxiliar para caminho de imagem (usada no carrossel)
// ────────────────────────────────────────────────
function obterCaminhoImagem(nomeArquivo) {
  if (!nomeArquivo) return 'img/default.png';
  if (nomeArquivo.startsWith('http')) return nomeArquivo;
  if (nomeArquivo.startsWith('img/')) return nomeArquivo;
  return `img/${nomeArquivo}`;
}