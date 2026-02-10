/*
 *---------- Algumas informações --------:
 * onde há # deve-se ser revisado e talvez reajustado
 *
 * Os produtos vêm do banco de dados através da API, usando um endpoint
 * público com método GET (para leitura).
 * O front consome esses dados e monta o HTML dinamicamente com JavaScript.
 *
 * O carrinho só serve pra organizar os itens antes de enviar o pedido completo para a API.
 * O pedido só é salvo no POST, quando o usuário confirma o pedido.
 * Antes disso, nada é salvo.
 *
 * Cancelamento de pedidos está na linha ~= 225
 */

const API_BASE = "https://cantina-api-rlqm.onrender.com";

// ────────────────────────────────────────────────
//  Elementos DOM mais usados (cache)
// ────────────────────────────────────────────────
const iconeCarrinho       = document.querySelector(".carrinho img");
const drawerCarrinho      = document.getElementById("drawer-carrinho");
const overlayCarrinho     = document.getElementById("overlay-carrinho");
const fecharDrawer        = document.getElementById("fecharDrawer");

// ────────────────────────────────────────────────
//  Estado global
// ────────────────────────────────────────────────
let carrinho = [];
let scrollPosition = 0;


let produtosGlobais = [];

/* =========================
   CARROSSEL
========================= */
const track = document.querySelector('.carrossel-track');
const btnEsq = document.querySelector('.esquerda');
const btnDir = document.querySelector('.direita');

let scroll = 0;

btnDir.addEventListener('click', () => {
  scrollPosition += 160;
  track.scrollTo({ left: scrollPosition, behavior: 'smooth' });
});

btnEsq.addEventListener('click', () => {
  scrollPosition -= 160;
  if (scrollPosition < 0) scrollPosition = 0;
  track.scrollTo({ left: scrollPosition, behavior: 'smooth' });
});


// ────────────────────────────────────────────────
//  SPA – Navegação entre páginas
// ────────────────────────────────────────────────
const botoesNav = document.querySelectorAll('.nav-botoes button');
const paginas   = document.querySelectorAll('.pagina');

function navegar(paginaId) {
  paginas.forEach(p => p.classList.remove('ativa'));
  document.getElementById(paginaId).classList.add('ativa');
}

botoesNav[0].addEventListener('click', () => navegar('inicio'));
botoesNav[1].addEventListener('click', () => navegar('cardapio'));
botoesNav[2].addEventListener('click', () => navegar('pedido'));
botoesNav[3].addEventListener('click', () => navegar('contato'));


// ────────────────────────────────────────────────
//  CARRINHO – Funções principais + Envio do pedido
// ────────────────────────────────────────────────
function adicionarAoCarrinho(id, nome, preco) {
  const itemExistente = carrinho.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ id, nome, preco, quantidade: 1 });
  }

  atualizarInterfaceCarrinho();

  drawerCarrinho.classList.add("ativo");
  overlayCarrinho.classList.add("ativo");
}

function atualizarInterfaceCarrinho() {
  const containerItens = document.querySelector(".drawer-itens");
  const totalTexto     = document.getElementById("valor-total-carrinho");

  containerItens.innerHTML = "";
  let total = 0;

  carrinho.forEach((item, index) => {
    total += item.preco * item.quantidade;

    containerItens.innerHTML += `
      <div class="item-no-carrinho">
        <div class="item-principal">
          <p class="item-nome">${item.nome}</p>
          
          <div class="controle-quantidade">
            <button class="btn-menos" onclick="alterarQuantidade(${index}, -1)">−</button>
            <span class="qtd-atual">${item.quantidade}</span>
            <button class="btn-mais" onclick="alterarQuantidade(${index}, 1)">+</button>
          </div>
          
          <p class="item-preco">R$ ${item.preco.toFixed(2)}</p>
        </div>
        
        <button class="btn-lixeira" onclick="removerDoCarrinho(${index})">🗑️</button>
      </div>
    `;
  });

  totalTexto.innerText = `R$ ${total.toFixed(2)}`;
}

function alterarQuantidade(index, delta) {
  if (!carrinho[index]) return;
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade < 1) carrinho[index].quantidade = 1;
  atualizarInterfaceCarrinho();
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);
  atualizarInterfaceCarrinho();
}

function limparCarrinho() {
  if (confirm("Deseja realmente limpar todo o carrinho?")) {
    carrinho = [];
    atualizarInterfaceCarrinho();
  }
}

// ────────────────────────────────────────────────
//  CARRINHO – Controle de abertura/fechamento
// ────────────────────────────────────────────────
iconeCarrinho.addEventListener("click", () => {
  const estaAberto = drawerCarrinho.classList.contains("ativo");
  drawerCarrinho.classList.toggle("ativo", !estaAberto);
  overlayCarrinho.classList.toggle("ativo", !estaAberto);
});

function fecharCarrinho() {
  drawerCarrinho.classList.remove("ativo");
  overlayCarrinho.classList.remove("ativo");
}

fecharDrawer.addEventListener("click", fecharCarrinho);
overlayCarrinho.addEventListener("click", fecharCarrinho);

// ────────────────────────────────────────────────
//  CARDÁPIO – Menu expansível 
// ────────────────────────────────────────────────
function toggleSection(id) {
  const section = document.getElementById(id);
  section.classList.toggle('escondido');

  const bar = section.previousElementSibling;
  const arrow = bar.querySelector('.menu-arrow');

  arrow.textContent = section.classList.contains('escondido') ? '▼' : '▲';
}

// ────────────────────────────────────────────────
//  MODAL – Cancelar Pedido
// ────────────────────────────────────────────────
const btnCancelar     = document.getElementById("btn-cancelar");
const modalCancelar   = document.getElementById("modal-cancelar");
const btnSair         = document.getElementById("btn-sair");  // só esse agora
const btnConfirmar    = document.getElementById("btn-confirmar");

if (btnCancelar) {
  btnCancelar.addEventListener("click", () => {
    if (modalCancelar) modalCancelar.style.display = "flex";
  });
}

if (btnSair) {
  btnSair.addEventListener("click", () => {
    if (modalCancelar) modalCancelar.style.display = "none";
  });
}

if (btnConfirmar) {
  btnConfirmar.addEventListener("click", async () => {
    const numero = document.getElementById("numero-pedido")?.value?.trim();
    const chave  = document.getElementById("palavra-chave")?.value?.trim();

    if (!numero || !chave) {
      alert("Preencha o número do pedido e a palavra-chave!");
      return;
    }

    try {
      const resposta = await fetch(
        `${API_BASE}/api/public/pedidos/${numero}/cancelar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ palavraChave: chave })
        }
      );

      if (resposta.ok) {
        alert("Pedido cancelado com sucesso!");
        modalCancelar.style.display = "none";
      } else {
        const erro = await resposta.text();
        alert(`Erro: ${erro || "Não foi possível cancelar o pedido."}`);
      }
    } catch (erro) {
      console.error("Erro ao cancelar:", erro);
      alert("Erro de conexão ao tentar cancelar.");
    }
  });
}

// ────────────────────────────────────────────────
//  MODAL – Informações / status do pedido
// ────────────────────────────────────────────────
const btnInfo         = document.getElementById("btn-info");
const modalInfo       = document.getElementById("modal-info");
const btnSairInfo     = document.getElementById("btn-sair-info");
const btnConsultar    = document.getElementById("btn-consultar");

if (btnInfo) {
  btnInfo.addEventListener("click", () => {
    if (modalInfo) {
      modalInfo.style.display = "flex";
    } else {
      console.warn("Modal #modal-info não encontrado no HTML");
    }
  });
}

if (btnSairInfo) {
  btnSairInfo.addEventListener("click", () => {
    if (modalInfo) modalInfo.style.display = "none";
  });
}

if (btnConsultar) {
  btnConsultar.addEventListener("click", async () => {
    const numero = document.getElementById("numero-info")?.value?.trim();

    if (!numero) {
      alert("Informe o número do pedido!");
      return;
    }

    try {
      const resposta = await fetch(`${API_BASE}/api/public/pedidos/${numero}`);
      if (!resposta.ok) {
        alert("Pedido não encontrado!");
        return;
      }

      const pedido = await resposta.json();
      alert(`Status do pedido: ${pedido.status}`);
      modalInfo.style.display = "none";
    } catch (erro) {
      console.error("Erro ao consultar pedido:", erro);
      alert("Erro de conexão ao consultar o status.");
    }
  });
}


// ────────────────────────────────────────────────
//  FORMULÁRIO – Fale Conosco
// ────────────────────────────────────────────────
document.getElementById("form-contato").addEventListener("submit", (e) => {
  e.preventDefault();

  const nome      = document.getElementById("nome").value;
  const whatsapp  = document.getElementById("whatsapp").value;
  const mensagem  = document.getElementById("mensagem").value;

  if (!nome || !whatsapp || !mensagem) {
    alert("Preencha todos os campos!");
    return;
  }

  alert(`Obrigado, ${nome}! Sua mensagem foi enviada.`);
  e.target.reset(); // limpa o formulário
});


// ────────────────────────────────────────────────
//  MODAL – Equipe de desenvolvimento (footer)
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const abrirEquipe   = document.getElementById("abrirEquipe");
  const modalEquipe   = document.getElementById("modal-equipe");
  const fecharEquipe  = document.getElementById("fecharEquipe");

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


// ────────────────────────────────────────────────
//  CARDÁPIO – Renderização de produtos
// ────────────────────────────────────────────────
function renderizarProdutosNoMenu(produtos) {
  const trackCarrossel = document.querySelector('.carrossel-track');
  trackCarrossel.innerHTML = ''; // Limpa itens estáticos

  // Carrossel – apenas promoções ou preço < 10   # revisar critério
  produtos.forEach(prod => {
    if (prod.promocao === true || prod.preco < 10) {
      const htmlOferta = `
        <div class="item">
          <img src="${prod.imagemUrl || 'img/default.png'}" alt="${prod.nome}" style="width:100px">
          <div class="separador"></div>
          <p class="legenda-item">${prod.nome}</p>
          <button class="btn-carrinho" onclick="adicionarAoCarrinho(${prod.id}, '${prod.nome.replace(/'/g, "\\'")}', ${prod.preco})">
            <img src="img/carrinho.png">
          </button>
        </div>
      `;
      trackCarrossel.innerHTML += htmlOferta;
    }
  });

  // Limpa containers de categorias
  const containerLanches  = document.getElementById('lanches');
  const containerDoces    = document.getElementById('doces');
  const containerBebidas  = document.getElementById('bebidas');

  if (!containerLanches || !containerDoces || !containerBebidas) return;

  containerLanches.innerHTML = '';
  containerDoces.innerHTML   = '';
  containerBebidas.innerHTML = '';

  produtos.forEach(prod => {
    const htmlItem = `
      <div class="itemcardapio">
        <img src="${prod.imagemUrl || 'img/default.png'}" alt="${prod.nome}">
        <div class="itemcardapio-texto">
          <h3>${prod.nome}</h3>
          <p>${prod.descricao || ''}</p>
        </div>
        <button class="botao-adicionar" onclick="adicionarAoCarrinho(${prod.id}, '${prod.nome.replace(/'/g, "\\'")}', ${prod.preco})">
          <img src="img/carrinho.png" alt="Carrinho">
        </button>
      </div>
    `;

    if (prod.categoria?.nome === 'Lanches') {
      containerLanches.innerHTML += htmlItem;
    } else if (prod.categoria?.nome === 'Doces') {
      containerDoces.innerHTML += htmlItem;
    } else if (prod.categoria?.nome === 'Bebidas') {
      containerBebidas.innerHTML += htmlItem;
    }
  });
}

async function carregarProdutosCardapio() {
  try {
    const resposta = await fetch(`${API_BASE}/api/public/produtos`);
    if (!resposta.ok) throw new Error("Falha ao buscar produtos");
    
    const dados = await resposta.json();
    renderizarProdutosNoMenu(dados);
  } catch (erro) {
    console.error("Erro ao carregar cardápio:", erro);
  }
}


// ────────────────────────────────────────────────
//  Inicialização
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutosCardapio();
});

//Modal do footer que exibe a equipe de desenvolvimento

document.addEventListener("DOMContentLoaded", () => {
    const abrirEquipe = document.getElementById("abrirEquipe");
    const modalEquipe = document.getElementById("modal-equipe");
    const fecharEquipe = document.getElementById("fecharEquipe");

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
});


/**
 * # Funções  de renderizar produtos , gerar pedidos e o obj estão abaixo 
 * 
 */
function renderizarProdutosNoMenu(produtos) {
    const menu = document.getElementById("menu-categorias");
    menu.innerHTML = "";

    const categorias = {};

    // agrupa produtos por categoria
    produtos.forEach(prod => {
        const nomeCategoria = prod.categoria.nome;
        const idCategoria = nomeCategoria
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-");

        if (!categorias[idCategoria]) {
            categorias[idCategoria] = {
                nome: nomeCategoria,
                produtos: []
            };
        }

        categorias[idCategoria].produtos.push(prod);
    });

    // cria o HTML das categorias
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
            containerItens.innerHTML += `
                <div class="itemcardapio">
                    <img src="${prod.imagemUrl || 'img/default.png'}">
                    <div class="itemcardapio-texto">
                        <h3>${prod.nome}</h3>
                        <p>${prod.descricao || ""}</p>
                    </div>
                    <button class="botao-adicionar"
                        onclick="adicionarAoCarrinho(${prod.id}, '${prod.nome}', ${prod.preco})">
                        <img src="img/carrinho.png">
                    </button>
                </div>
            `;
        });
    });
}


    


    






// Função para buscar produtos da API

async function carregarProdutosCardapio() {
    try {
        //  URL pública para listar produtos
        const resposta = await fetch(`${API_BASE}/api/public/produtos`);
        const dados = await resposta.json();
        
        
        // Passamos os dados recebidos para a função  "renderizarProdutosNoMenu"

        produtosGlobais = dados;
        renderizarProdutosNoMenu(dados);
    } catch (erro) {
        console.error("Erro ao carregar cardápio:", erro);
    }
}

// Chamar a função assim que a página carregar
document.addEventListener("DOMContentLoaded", carregarProdutosCardapio);



//Função que envia o pedido pro BACK

async function enviarPedidoParaAPI() {
    if (carrinho.length === 0) {
        alert("O seu carrinho está vazio!");
        return;
    }

    // Montando o objeto conforme o Manual 

    const pedido = 
    {
    nomeAluno: prompt("Qual o seu nome?"),
    palavraChave: "teste123", 
    horarioRetirada: "10:30",
    formaPagamento: "PIX",
    observacoes: "Pedido via Site",
    itens: carrinho.map(item => ({
    produtoId: item.id,
    quantidade: 1
  }))
};


    try {
        const resposta = await fetch(`${API_BASE}/api/public/pedidos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido)
        });

        if (resposta.ok) {
            const resultado = await resposta.json();
            alert(`Pedido enviado! Seu número de retirada é: ${resultado.numeroRetirada}`);
            
            // Limpa o carrinho após o sucesso
            carrinho = [];
            atualizarInterfaceCarrinho();
            fecharCarrinho();
        } else {
            alert("Erro ao enviar pedido. Verifique se a cantina está aberta.");
        }
    } catch (erro) {
        console.error("Erro na conexão:", erro);
    }
}




//faz a pesquisa pela barra de pesquisa e filtra de vdd 

const inputPesquisa = document.getElementById("pesquisa-produto");

inputPesquisa.addEventListener("input", () => {
    const termo = inputPesquisa.value.toLowerCase().trim();

    if (termo === "") {
        renderizarProdutosNoMenu(produtosGlobais);
        return;
    }

    const filtrados = produtosGlobais.filter(prod =>
        prod.nome.toLowerCase().includes(termo) ||
        (prod.descricao && prod.descricao.toLowerCase().includes(termo)) ||
        (prod.categoria?.nome && prod.categoria.nome.toLowerCase().includes(termo))
    );

    renderizarProdutosNoMenu(filtrados);
});




