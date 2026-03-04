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

console.log("inicio.js carregado com sucesso!");
console.log("API_BASE:", API_BASE); // deve mostrar a URL completa


/* ================================================ */
/* CARREGA AS OFERTAS VIGENTES DA API PÚBLICA      */
/* Endpoint correto: /api/public/ofertas (conforme manual do professor) */
/* ================================================ */
async function carregarProdutosParaInicio() {
  try {
    const loading = document.getElementById("loading-ofertas");
    if (loading) loading.style.display = "block";

    console.log("Buscando promoções em:", `${API_BASE}/api/public/ofertas`);

    const resposta = await fetch(`${API_BASE}/api/public/ofertas`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status} - ${await resposta.text()}`);
    }

    const ofertas = await resposta.json();
    console.log("Promoções recebidas do backend:", ofertas);

    renderizarCarrossel(ofertas);

    if (loading) loading.style.display = "none";

  } catch (erro) {
    console.error("Erro ao carregar promoções:", erro);
    
    const loading = document.getElementById("loading-ofertas");
    if (loading) {
      loading.innerHTML = '<p style="color:#c62828; font-weight:bold; text-align:center; padding:40px; font-size:18px;">Não foi possível carregar as promoções. Tente novamente.</p>';
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

/* ============================================= */
/*        RENDERIZA OS PRODUTOS EM OFERTA        */
/* ============================================= */
function renderizarCarrossel(ofertas) {
  const trackCarrossel = document.querySelector('.carrossel-track');
  if (!trackCarrossel) return;

  trackCarrossel.innerHTML = '';

  if (ofertas.length === 0) {
    trackCarrossel.innerHTML = '<p style="text-align:center; color:#555; padding:40px; font-size:18px;">Nenhuma promoção vigente no momento.</p>';
    return;
  }

  ofertas.forEach(oferta => {
    const caminhoImg = obterCaminhoImagem(oferta.imagemUrl || oferta.foto || 'img/default.png');

    const htmlOferta = `
      <div class="item">
        <img 
            src="${caminhoImg}" 
            alt="${oferta.descricao}" 
            onerror="this.src='img/default.png';"
        >
        
        <div class="legenda-item">
          ${oferta.descricao}
          <br>
          <strong>R$ ${oferta.valorPromocional.toFixed(2)}</strong>
        </div>
        
        <button class="btn-carrinho" onclick="adicionarAoCarrinho(${oferta.id}, '${oferta.descricao.replace(/'/g, "\\'")}', ${oferta.valorPromocional})">
          <img src="img/carrinho.png">
        </button>
      </div>
    `;
    trackCarrossel.innerHTML += htmlOferta;
  });
}


// Força chamada imediata para debug
console.log("Chamando carregarProdutosParaInicio manualmente para teste");
carregarProdutosParaInicio();