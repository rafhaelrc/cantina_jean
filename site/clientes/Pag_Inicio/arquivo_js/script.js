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



// CARRINHO 

const icone_Carrinho = document.querySelector(".carrinho img");
const painel_oculto = document.getElementById("drawer-carrinho");
const fecharPainel = document.getElementById("fecharDrawer");
const overlay = document.getElementById("overlay-carrinho");//overlay melhora a UX do carrinho

//ativa ao clicar 
icone_Carrinho.addEventListener("click", () => {
    if (painel_oculto.classList.contains("ativo")) {
        // Fecha se está aberto
        painel_oculto.classList.remove("ativo");
        overlay.classList.remove("ativo");
    }
    else {
        // Abre se está fechado
        painel_oculto.classList.add("ativo");
        overlay.classList.add("ativo");
    }
});

//Função que fecha o carrinho 

function fecharCarrinho() {
    painel_oculto.classList.remove("ativo");
    overlay.classList.remove("ativo");
}

fecharPainel.addEventListener("click", fecharCarrinho);
overlay.addEventListener("click", fecharCarrinho);

/* =========================
   CARDÁPIO
========================= */

//Menu Expansivo

function toggleSection(id) {
  const section = document.getElementById(id);
  section.classList.toggle('escondido');

  // pega a barra anterior à seção
  const bar = section.previousElementSibling;
  const arrow = bar.querySelector('.menu-arrow');

  // troca a seta conforme aberto/fechado
  if (section.classList.contains('escondido')) {
    arrow.textContent = '▼'; // fechado
  } else {
    arrow.textContent = '▲'; // aberto
  }
}

/* =========================
   PEDIDO - STATUS
========================= */

document.getElementById("btn-info").addEventListener("click", () => {
    alert("Mostrando informações do pedido...");
});

/* =========================
   MODAL CANCELAR PEDIDO
========================= */
const btnCancelar = document.getElementById("btn-cancelar");
const modalCancelar = document.getElementById("modal-cancelar");
const btnSair = document.getElementById("btn-sair");
const btnConfirmar = document.getElementById("btn-confirmar");

// Abrir modal ao clicar em "Cancelar Pedido"
btnCancelar.addEventListener("click", () => {
  modalCancelar.style.display = "flex";
});

// Fechar modal ao clicar em "Sair"
btnSair.addEventListener("click", () => {
  modalCancelar.style.display = "none";
});

// Confirmar cancelamento
btnConfirmar.addEventListener("click", () => {
  const numero = document.getElementById("numero-pedido").value;
  const chave = document.getElementById("palavra-chave").value;

  if (numero && chave) {
    alert(`Pedido ${numero} cancelado com sucesso!`);
    modalCancelar.style.display = "none";
  } else {
    alert("Preencha todos os campos!");
  }
});

