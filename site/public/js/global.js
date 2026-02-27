/* ================================================================== */
/*                        global.js                                   */
/* Código compartilhado por TODAS as páginas                          */
/* API_BASE, carrinho persistente no localStorage, funções básicas    */
/* ================================================================== */

const API_BASE = "https://cantina-api-rlqm.onrender.com";

/* ──────────────────────────────────────────────── */
/* ESTADO GLOBAL DO CARRINHO                          */
/* (salvo no navegador para persistir entre páginas)  */
/* ──────────────────────────────────────────────── */
let carrinho = JSON.parse(localStorage.getItem('carrinhoCantina')) || [];

/* Salva o estado atual do carrinho no localStorage */
function salvarCarrinho() {
    localStorage.setItem('carrinhoCantina', JSON.stringify(carrinho));
}

/* Atualiza o número exibido no ícone do carrinho (se o elemento existir) */
function atualizarContadorCarrinho() {
    const contador = document.querySelector('.carrinho-contador');
    if (!contador) return;

    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    contador.textContent = totalItens > 0 ? totalItens : '';
    contador.style.display = totalItens > 0 ? 'flex' : 'none';
}

/* ──────────────────────────────────────────────── */
/* FUNÇÃO AUXILIAR PARA IMAGENS (usada em várias páginas) */
/* Garante que sempre haja uma imagem válida ou fallback */
/* ──────────────────────────────────────────────── */
function obterCaminhoImagem(nomeArquivo) {
    if (!nomeArquivo) return 'img/default.png';
    if (nomeArquivo.startsWith('http')) return nomeArquivo;
    if (nomeArquivo.startsWith('img/')) return nomeArquivo;
    return `img/${nomeArquivo}`;
}

// ────────────────────────────────────────────────
//  MODAL – Equipe de desenvolvimento (footer)
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Atualiza o contador do ícone do carrinho imediatamente
    atualizarContadorCarrinho();

    // Controle do modal da equipe de desenvolvimento (link no rodapé)
    const abrirEquipe = document.getElementById("abrirEquipe");
    const modalEquipe = document.getElementById("modal-equipe");
    const fecharEquipe = document.getElementById("fecharEquipe");

    if (abrirEquipe && modalEquipe && fecharEquipe) {
        abrirEquipe.addEventListener("click", () => {
            modalEquipe.classList.add("ativo");
        });

        fecharEquipe.addEventListener("click", () => {
            modalEquipe.classList.remove("ativo");
        });

        modalEquipe.addEventListener("click", (e) => {
            if (e.target === modalEquipe) {
                modalEquipe.classList.remove("ativo");
            }
        });
    }
});
