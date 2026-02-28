

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