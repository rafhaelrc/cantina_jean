/* ================================================ */
/*                 carrinho.js                      */
/* Lógica exclusiva da página Carrinho              */
/* ================================================ */

// ────────────────────────────────────────────────
//  Elementos DOM mais usados (cache)
// ────────────────────────────────────────────────
const iconeCarrinho = document.querySelector(".carrinho img");
const overlayCarrinho = document.getElementById("overlay-carrinho");

// ────────────────────────────────────────────────
//  Estado global
// ────────────────────────────────────────────────

let scrollPosition = 0;
let produtosGlobais = [];

// Atualiza a lista de itens na página carrinho.html
function atualizarInterfaceCarrinho() {
  const containerItens = document.querySelector(".carrinho-itens");
  const totalTexto = document.getElementById("valor-total-carrinho");

  if (!containerItens || !totalTexto) return;

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

// Carrega os itens ao abrir a página carrinho
document.addEventListener("DOMContentLoaded", () => {
  atualizarInterfaceCarrinho();
});

function alterarQuantidade(index, delta) {
  if (!carrinho[index]) return;
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade < 1) carrinho[index].quantidade = 1;
  atualizarInterfaceCarrinho();
}

function removerDoCarrinho(index) {
  carrinho.splice(index, 1);          // Remove o item do array
  salvarCarrinho();                   // SALVA A MUDANÇA NO LOCALSTORAGE (isso era o que faltava)
  atualizarInterfaceCarrinho();       // Atualiza a lista na tela
}

function limparCarrinho() {
  if (confirm("Deseja realmente limpar todo o carrinho?")) {
    carrinho = [];
    salvarCarrinho();          // ← ADICIONE ESSA LINHA AQUI
    atualizarInterfaceCarrinho();
  }
}

// ────────────────────────────────────────────────
//  ENVIAR PEDIDO – Função principal 
// ────────────────────────────────────────────────

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
      salvarCarrinho();          // ← ADICIONE ESSA LINHA AQUI
      atualizarInterfaceCarrinho();
      // redireciona para home após 3 segundos
      
      //fecharCarrinho();

      // Limpa todos os campos do formulário no drawer
      document.getElementById("nomeAluno").value = "";
      document.getElementById("palavraChave").value = "";
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