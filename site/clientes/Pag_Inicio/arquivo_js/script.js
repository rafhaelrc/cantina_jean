
// BACKEND - CONFIGURAÇÕES      


const API_BASE = "https://cantina-api-rlqm.onrender.com";



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
    carrinho.push({ id, nome, preco });
    
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
        total += item.preco;
        containerItens.innerHTML += `
            <div class="item-no-carrinho">
                <p>${item.nome} - R$ ${item.preco.toFixed(2)}</p>
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




function renderizarProdutosNoMenu(produtos) {

  
const trackCarrossel = document.querySelector('.carrossel-track');
trackCarrossel.innerHTML = ''; // Limpa os itens estáticos

produtos.forEach(prod => {
    // Se o produto estiver em promoção (ou apenas para preencher o carrossel)
    if (prod.promocao === true || prod.preco < 10) { 
        const htmlOferta = `
            <div class="item">
                <img src="${prod.imagemUrl || 'img/default.png'}" alt="${prod.nome}" style="width:100px">
                <p>${prod.nome}</p>
                <div class="separador"></div>
                <button class="btn-carrinho" onclick="adicionarAoCarrinho(${prod.id}, '${prod.nome}', ${prod.preco})">
                    <img src="img/carrinho.png" alt="Adicionar">
                </button>
            </div>
        `;
        trackCarrossel.innerHTML += htmlOferta;
    }
    

});
    // Limpa todos os containers primeiro
    const containerLanches = document.getElementById('lanches');
    const containerDoces = document.getElementById('doces');
    const containerBebidas = document.getElementById('bebidas');
    
    containerLanches.innerHTML = '';
    containerDoces.innerHTML = '';
    containerBebidas.innerHTML = '';

    produtos.forEach(prod => {
        // Cria o HTML do item 
        const htmlItem = `
            <div class="itemcardapio">
                <img src="${prod.imagemUrl || 'img/default.png'}" alt="${prod.nome}">
                <div class="itemcardapio-texto">
                    <h3>${prod.nome}</h3>
                    <p>${prod.descricao}</p>
                    <span>R$ ${prod.preco.toFixed(2)}</span>
                </div>
                <button class="botao-adicionar" onclick="adicionarAoCarrinho(${prod.id}, '${prod.nome}', ${prod.preco})"> 
                    <img src="img/carrinho.png" alt="Carrinho"> 
                </button>
            </div>
        `;

        //  Qual a Lógica ?Se o produto for da categoria 1, vai para lanches, etc.
        // Verifique no seu banco/manual quais são os nomes ou IDs das categorias
        if (prod.categoria.nome === 'Lanches') {
            containerLanches.innerHTML += htmlItem;
        } else if (prod.categoria.nome === 'Doces') {
            containerDoces.innerHTML += htmlItem;
        } else if (prod.categoria.nome === 'Bebidas') {
            containerBebidas.innerHTML += htmlItem;
        }
    });
}




// Função para buscar produtos da API
async function carregarProdutosCardapio() {
    try {
        // Conforme o manual: URL pública para listar produtos
        const resposta = await fetch(`${API_BASE}/api/public/produtos`);
        const dados = await resposta.json();
        
        // Agora passamos os dados recebidos para a função que você já criou
        renderizarProdutosNoMenu(dados);
    } catch (erro) {
        console.error("Erro ao carregar cardápio:", erro);
    }
}

// Chamar a função assim que a página carregar
document.addEventListener("DOMContentLoaded", carregarProdutosCardapio);






async function enviarPedidoParaAPI() {
    if (carrinho.length === 0) {
        alert("O seu carrinho está vazio!");
        return;
    }

    // Montando o objeto conforme o Manual ( da pág. 4)

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


