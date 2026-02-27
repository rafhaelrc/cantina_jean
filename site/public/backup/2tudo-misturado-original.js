

// ────────────────────────────────────────────────
//  Elementos DOM mais usados (cache)
// ────────────────────────────────────────────────
const iconeCarrinho = document.querySelector(".carrinho img");
const drawerCarrinho = document.getElementById("drawer-carrinho");
const overlayCarrinho = document.getElementById("overlay-carrinho");
const fecharDrawer = document.getElementById("fecharDrawer");

// ────────────────────────────────────────────────
//  Estado global
// ────────────────────────────────────────────────
let carrinho = [];
let scrollPosition = 0;


let produtosGlobais = [];


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
  const totalTexto = document.getElementById("valor-total-carrinho");

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
//  ENVIAR PEDIDO – Função principal (compatível com seu HTML e backend)
// ────────────────────────────────────────────────
async function enviarPedido() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio! Adicione itens antes de enviar.");
    return;
  }

  // Pegar valores dos inputs (IDs exatos do seu HTML)
  const nomeAluno = document.getElementById("nomeAluno")?.value.trim();
  const palavraChave = document.getElementById("palavra-chave")?.value.trim();
  const horarioRetirada = document.getElementById("horarioRetirada")?.value;
  const observacoes = document.getElementById("observacoes")?.value.trim();

  // Forma de pagamento (radio)
  const pagamentoSelecionado = document.querySelector('input[name="pagamento"]:checked');
  const formaPagamento = pagamentoSelecionado ? pagamentoSelecionado.value : "PIX";

  // Validação obrigatória (campos que o backend exige)
  if (!nomeAluno) {
    alert("Por favor, informe seu nome.");
    return;
  }
  if (!palavraChave) {
    alert("A palavra-chave é obrigatória (usada para cancelamento futuro).");
    return;
  }
  if (!horarioRetirada) {
    alert("Informe o horário de retirada desejado.");
    return;
  }

  // Montar o objeto no formato exato do backend
  const pedido = {
    nomeAluno: nomeAluno,
    palavraChave: palavraChave,
    horarioRetirada: horarioRetirada,          // ex: "14:30"
    formaPagamento: formaPagamento,
    observacoes: observacoes || null,          // pode ser nulo
    itens: carrinho.map(item => ({
      produtoId: item.id,
      quantidade: item.quantidade
    }))
  };

  try {
    // Feedback visual no botão
    const botao = document.querySelector(".btn-fazer");
    const textoOriginal = botao.textContent;
    botao.textContent = "Enviando...";
    botao.disabled = true;

    const resposta = await fetch(`${API_BASE}/api/public/pedidos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pedido)
    });

    if (resposta.ok) {
      const resultado = await resposta.json();

      alert(`✅ Pedido realizado com sucesso!\n\n` +
        `Número de retirada: ${resultado.numeroRetirada}\n` +
        `Total: R$ ${resultado.valorTotal.toFixed(2)}\n` +
        `Status: ${resultado.status}\n\n` +
        `Guarde o número de retirada!`);

      // Sucesso → limpar tudo
      carrinho = [];
      atualizarInterfaceCarrinho();
      fecharCarrinho();

      // Limpar campos do formulário
      document.getElementById("nomeAluno").value = "";
      document.getElementById("palavra-chave").value = "";
      document.getElementById("horarioRetirada").value = "";
      document.getElementById("observacoes").value = "";

      // Opcional: desmarcar rádio ou voltar pro PIX
      const pixRadio = document.querySelector('input[name="pagamento"][value="PIX"]');
      if (pixRadio) pixRadio.checked = true;
    }
    else {
      let mensagemErro = "Não foi possível enviar o pedido.";
      try {
        const erroJson = await resposta.json();
        mensagemErro = erroJson.message || mensagemErro;
      } catch {
        const textoErro = await resposta.text();
        mensagemErro = textoErro || mensagemErro;
      }

      // Tratamento específico comum
      if (mensagemErro.toLowerCase().includes("fechad")) {
        alert("A Cantina está fechada no momento. Tente novamente em outro horário!");
      } else if (mensagemErro.includes("horário") || mensagemErro.includes("retirada")) {
        alert("Horário de retirada inválido ou fora do expediente.");
      } else {
        alert(`Erro do servidor: ${mensagemErro}\n\n(Tente novamente ou fale conosco)`);
      }
    }
  }
  catch (erro) {
    console.error("Erro ao enviar pedido:", erro);
    alert("Falha na conexão com o servidor.\nVerifique sua internet e tente novamente.");
  }
  finally {
    // Sempre restaura o botão
    const botao = document.querySelector(".btn-fazer");
    botao.textContent = "Fazer Pedido";
    botao.disabled = false;
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


// Função principal para enviar o pedido ao backend
async function enviarPedido() {

  // Verifica se o carrinho está vazio antes de tentar enviar
  if (carrinho.length === 0) {
    alert("O seu carrinho está vazio! Adicione itens antes de enviar.");
    return; // Sai da função imediatamente se não tiver itens
  }

  // Pega os valores dos campos do formulário no drawer
  // Usamos ?. para evitar erro se o elemento não existir
  // .trim() remove espaços em branco no início e fim
  const nomeAluno = document.getElementById("nomeAluno")?.value?.trim() || "";
  const palavraChave = document.getElementById("palavraChave")?.value?.trim() || "";
  const horarioRetirada = document.getElementById("horarioRetirada")?.value || "";
  const observacoes = document.getElementById("observacoes")?.value?.trim() || "";

  console.log("=== DEBUG DOS CAMPOS ===");
  console.log("Nome:", nomeAluno, "(length:", nomeAluno.length, ")");
  console.log("Palavra-chave raw:", document.getElementById("palavraChave")?.value);
  console.log("Palavra-chave após trim:", palavraChave, "(length:", palavraChave.length, ")");
  console.log("Horário:", horarioRetirada);

  // Pega a forma de pagamento escolhida no radio button
  // Se nenhum estiver marcado (improvável), usa "PIX" como padrão
  const pagamentoSelecionado = document.querySelector('input[name="pagamento"]:checked');
  const formaPagamento = pagamentoSelecionado ? pagamentoSelecionado.value : "PIX";



  // Validação dos campos obrigatórios
  // Se algum estiver vazio, mostra alerta e sai da função
  if (!nomeAluno || !palavraChave || !horarioRetirada) {
    let mensagemErro = "Por favor, preencha os campos obrigatórios:\n";
    if (!nomeAluno) mensagemErro += "• Nome\n";
    if (!palavraChave) mensagemErro += "• Palavra-chave\n";
    if (!horarioRetirada) mensagemErro += "• Horário de Retirada\n";
    alert(mensagemErro);
    return;
  }

  // Monta o objeto JSON que será enviado para o backend
  // Formato exato que a API espera
  const pedido = {
    nomeAluno,          // Nome do aluno/aluno
    palavraChave,       // Palavra usada para cancelamento futuro
    horarioRetirada,    // Ex: "14:30"
    formaPagamento,     // "PIX", "BALCAO", etc.
    observacoes,        // Pode ser vazio ou nulo
    itens: carrinho.map(item => ({
      produtoId: item.id,       // ID do produto vindo do banco
      quantidade: item.quantidade
    }))
  };

  try {
    // Pega o botão para mostrar "Enviando..." e desabilitar durante a requisição
    const botao = document.querySelector(".btn-fazer");
    const textoOriginal = botao.innerText;
    botao.innerText = "Enviando...";
    botao.disabled = true;

    console.log("JSON que vai ser enviado:");
    console.log(JSON.stringify(pedido, null, 2));

    // Faz a requisição POST para a API
    const token = localStorage.getItem("authToken") || "";

if (!token) {
  alert("Não foi possível autenticar. Tente recarregar a página ou falar com o dev.");
  return;
}

const resposta = await fetch(`${API_BASE}/api/public/pedidos`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    //"Authorization": `Bearer ${token}`  // agora envia o token corretamente
  },
  body: JSON.stringify(pedido)
});

    // Verifica se a resposta foi bem-sucedida (status 200-299)
    if (resposta.ok) {
      // Converte a resposta do servidor em objeto JavaScript
      const resultado = await resposta.json();

      // Limpa o carrinho após sucesso
      carrinho = [];
      atualizarInterfaceCarrinho();
      fecharCarrinho();

      // Limpa todos os campos do formulário no drawer
      document.getElementById("nomeAluno").value = "";
      document.getElementById("palavra-chave").value = "";
      document.getElementById("horarioRetirada").value = "";
      document.getElementById("observacoes").value = "";

      // Abre o modal customizado com o número de retirada
      document.getElementById("numero-retirada-modal").textContent = resultado.numeroRetirada;
      document.getElementById("modal-sucesso-pedido").style.display = "flex";

    } else {
      // Se o servidor respondeu com erro (ex: 400, 500)
      const erroTexto = await resposta.text();

      // Tratamento específico para quando a cantina está fechada
      if (erroTexto.toLowerCase().includes("fechada") || erroTexto.toLowerCase().includes("fechado")) {
        alert("⛔ A Cantina está FECHADA no momento. Tente novamente mais tarde.");
      } else {
        alert("Erro ao enviar o pedido. Verifique os dados ou tente novamente.");
      }
    }

  } catch (erro) {
    // Erro de rede, servidor offline, CORS, etc.
    console.error("Erro completo ao enviar pedido:", erro);
    alert("Falha na conexão com o servidor.\nVerifique sua internet e tente novamente.");

  } finally {
    // Sempre executa, mesmo dando erro
    // Restaura o botão para o estado normal
    const botao = document.querySelector(".btn-fazer");
    botao.innerText = "Fazer Pedido";
    botao.disabled = false;
  }
}

// Função para login com admin/123
async function loginAdmin() {
  try {
    const respostaLogin = await fetch(`${API_BASE}/api/auth/login`, {  // ajuste a rota se não for exatamente essa
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "123"
      })
    });

    if (!respostaLogin.ok) {
      console.log("Login falhou:", respostaLogin.status);
      alert("Login falhou! Pergunte ao dev a rota correta ou credenciais.");
      return;
    }

    const dados = await respostaLogin.json();
    const token = dados.token || dados.accessToken || dados.jwt;

    if (token) {
      localStorage.setItem("authToken", token);
      console.log("Login OK! Token salvo:", token.substring(0, 20) + "...");
    } else {
      alert("Token não veio na resposta do login.");
    }
  } catch (erro) {
    console.error("Erro no login:", erro);
  }
}

// Chama o login ao carregar a página (uma vez só)
// document.addEventListener("DOMContentLoaded", async () => {
//   if (!localStorage.getItem("authToken")) {
//     await fazerLoginAutomatico();
//   }
// });


































// ────────────────────────────────────────────────
//  MODAL – Cancelar Pedido
// ────────────────────────────────────────────────
const btnCancelar = document.getElementById("btn-cancelar");
const modalCancelar = document.getElementById("modal-cancelar");
const btnSair = document.getElementById("btn-sair");  // só esse agora
const btnConfirmar = document.getElementById("btn-confirmar");

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
    const chave = document.getElementById("palavra-chave")?.value?.trim();

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
const btnInfo = document.getElementById("btn-info");
const modalInfo = document.getElementById("modal-info");
const btnSairInfo = document.getElementById("btn-sair-info");
const btnConsultar = document.getElementById("btn-consultar");

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

  const nome = document.getElementById("nome").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const mensagem = document.getElementById("mensagem").value;

  if (!nome || !whatsapp || !mensagem) {
    alert("Preencha todos os campos!");
    return;
  }

  alert(`Obrigado, ${nome}! Sua mensagem foi enviada.`);
  e.target.reset(); // limpa o formulário
});




















// ==================================================================
//  NOVAS FUNÇÕES CORRIGIDAS 
// ==================================================================


// 3. Renderiza o Cardápio Completo (Acordeão por Categorias)
function renderizarCardapioCompleto(produtos) {
  const menu = document.getElementById("menu-categorias");
  if (!menu) return;

  menu.innerHTML = "";
  const categorias = {};

  // Agrupa
  produtos.forEach(prod => {
    const nomeCategoria = prod.categoria ? prod.categoria.nome : "Outros";
    const idCategoria = nomeCategoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");

    if (!categorias[idCategoria]) {
      categorias[idCategoria] = { nome: nomeCategoria, produtos: [] };
    }
    categorias[idCategoria].produtos.push(prod);
  });

  // Cria HTML
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

// 4. Busca dados da API e chama as renderizações
async function carregarProdutosCardapio() {
  try {
    const resposta = await fetch(`${API_BASE}/api/public/produtos`);
    const dados = await resposta.json();

    produtosGlobais = dados; // Salva na global para a pesquisa funcionar

    // CHAMA AS DUAS FUNÇÕES
    renderizarCarrossel(dados);
    renderizarCardapioCompleto(dados);

  } catch (erro) {
    console.error("Erro ao carregar cardápio:", erro);
  }
}

// Inicia ao carregar a página
document.addEventListener("DOMContentLoaded", carregarProdutosCardapio);




// 6. Pesquisa (Atualizada para usar a nova função de renderizar menu)
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

