/*
*----------Algumas informações--------:
 onde há # deve-se ser revisado e talvez reajustado 
*
 Os produtos  vêm do banco de dados através da API, usando um endpoint
público com método GET (para leitura). 
O front consome esses dados e monta o HTML dinamicamente com JavaScript.

O carrinho  só serve pra organizar 
os itens antes de enviar o pedido completo para a API.

 o pedido só é salvo no POST,quando o usuário confirma o pedido.
 Antes disso, nada é salvo.”

 Cancelamento de pedidos esta na linha ~= 225
*
*/
    


const API_BASE = "https://cantina-api-rlqm.onrender.com";



let produtosGlobais = [];

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

let carrinho = [];

function adicionarAoCarrinho(id, nome, preco) {
    // Adiciona o item ao array (memória)
    const itemExistente = carrinho.find(item => item.id === id);

if (itemExistente) {
    itemExistente.quantidade++;
} else {
    carrinho.push({ id, nome, preco, quantidade: 1 });
}

    
    // Atualiza a interface (desenha no drawer)
    atualizarInterfaceCarrinho();
    
    // Abre o carrinho para mostrar que funcionou (opcional, mas bom UX)
    document.getElementById("drawer-carrinho").classList.add("ativo");
    document.getElementById("overlay-carrinho").classList.add("ativo");
}

function atualizarInterfaceCarrinho() {
    const containerItens = document.querySelector(".drawer-itens");
    const totalTexto = document.getElementById("valor-total-carrinho");
    
    containerItens.innerHTML = "";
    let total = 0;

   carrinho.forEach((item, index) => {
    total += item.preco * item.quantidade;

    containerItens.innerHTML += `
        <div class="item-no-carrinho">
            <p>
                ${item.nome} <br>
                ${item.quantidade}x R$ ${item.preco.toFixed(2)}
            </p>
            <button onclick="removerDoCarrinho(${index})">❌</button>
        </div>
    `;
});

    totalTexto.innerText = `Total: R$ ${total.toFixed(2)}`;
}

function removerDoCarrinho(index) {
    // Remove 1 item do array na posição (index) clicada
    carrinho.splice(index, 1);
    
    // Desenha a lista novamente para atualizar o valor total e os itens
    atualizarInterfaceCarrinho();
}



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


//  A função consulta no backend o status real de um pedido 
// usando o número de retirada.


document.getElementById("btn-info").addEventListener("click", async () => {
  const numero = document.getElementById("numero-pedido").value;

  if (!numero) {
    alert("Informe o número do pedido!");
    return;
  }

  try {
    const resposta = await fetch(
      `${API_BASE}/api/public/pedidos/${numero}`
    );

    if (!resposta.ok) {
      alert("Pedido não encontrado!");
      return;
    }

    const pedido = await resposta.json();
    alert(`Status do pedido: ${pedido.status}`);
  } catch (erro) {
    console.error("Erro ao consultar pedido:", erro);
  }
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




// # Confirmar cancelamento  (atualizado pra API)

btnConfirmar.addEventListener("click", async () => {
  const numero = document.getElementById("numero-pedido").value;
  const chave = document.getElementById("palavra-chave").value;

  if (!numero || !chave) {
    alert("Preencha todos os campos!");
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
      alert("Não foi possível cancelar o pedido.");
    }
  } catch (erro) {
    console.error("Erro ao cancelar pedido:", erro);
  }
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




