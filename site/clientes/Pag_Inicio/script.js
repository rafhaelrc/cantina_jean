/* =========================
   CARROSSEL
========================= */
const track = document.querySelector('.carrossel-track');
const btnEsq = document.querySelector('.esquerda');
const btnDir = document.querySelector('.direita');

let scroll = 0;

btnDir.addEventListener('click', () => {
  scroll += 160;
  track.scrollTo({
    left: scroll,
    behavior: 'smooth'
  });
});

btnEsq.addEventListener('click', () => {
  scroll -= 160;
  if (scroll < 0) scroll = 0;
  track.scrollTo({
    left: scroll,
    behavior: 'smooth'
  });
});

/* =========================
   SPA NAVEGAÇÃO
========================= */
const botoes = document.querySelectorAll('.nav-botoes button');
const paginas = document.querySelectorAll('.pagina');

// Função para alternar páginas
function navegar(paginaId) {
  paginas.forEach(p => p.classList.remove('ativa'));
  document.getElementById(paginaId).classList.add('ativa');
}

// Liga cada botão a uma página
botoes[0].addEventListener('click', () => navegar('inicio'));
botoes[1].addEventListener('click', () => navegar('cardapio'));
botoes[2].addEventListener('click', () => navegar('pedido'));
botoes[3].addEventListener('click', () => navegar('contato'));

/* =========================
   OPCIONAL: URL HASH
========================= */
// Isso permite que a URL mude (#cardapio) e o botão "voltar" funcione
window.addEventListener('hashchange', () => {
  const paginaId = location.hash.replace('#', '');
  if (document.getElementById(paginaId)) {
    navegar(paginaId);
  }
});

// Se já tiver hash na URL ao carregar, abre direto
window.addEventListener('load', () => {
  const paginaId = location.hash.replace('#', '');
  if (paginaId && document.getElementById(paginaId)) {
    navegar(paginaId);
  }
});




// CARINHO 

const icone_Carrinho = document.querySelector(".carrinho img");
const painel_oculto = document.getElementById("drawer-carrinho");
const fecharPainel = document.getElementById("fecharDrawer");
const overlay = document.getElementById("overlay-carrinho");//overlay melhora a UX do carrinho

//ativa ao clicar 
icone_Carrinho.addEventListener("click", () => {
    painel_oculto.classList.add("ativo");
    overlay.classList.add("ativo");
});

//Função que fecha o carrinho 

function fecharCarrinho() {
    painel_oculto.classList.remove("ativo");
    overlay.classList.remove("ativo");
}

fecharPainel.addEventListener("click", fecharCarrinho);
overlay.addEventListener("click", fecharCarrinho);
