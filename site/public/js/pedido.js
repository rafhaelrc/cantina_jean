// ────────────────────────────────────────────────
//  MODAL – Cancelar Pedido
// Conforme manual do professor: PATCH /api/public/pedidos/{id}/cancelar
// Corpo: { "palavraChave": "..." }
// Só cancela se status for "AGUARDANDO"
// ────────────────────────────────────────────────
const btnCancelar = document.getElementById("btn-cancelar");
const modalCancelar = document.getElementById("modal-cancelar");
const btnSair = document.getElementById("btn-sair");
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
      console.log("DEBUG CANCELAR:");
      console.log("URL:", `${API_BASE}/api/public/pedidos/${dado.id}/cancelar`);
      console.log("Body enviado:", JSON.stringify({ palavraChave: chave }));

      const resposta = await fetch(
        `${API_BASE}/api/public/pedidos/${dado.id}/cancelar`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ palavraChave: chave })
        }
      );

      console.log("Resposta status:", resposta.status);
      console.log("Resposta OK?", resposta.ok);

      const textoResposta = await resposta.text();
      console.log("Texto da resposta:", textoResposta);

      if (resposta.ok) {
        alert("Pedido cancelado com sucesso!");
        modalCancelar.style.display = "none";
      } else {
        let erroMsg = textoResposta || `Erro HTTP ${resposta.status}`;
        alert(`Erro: ${erroMsg}`);
      }
    } catch (erro) {
      console.error("Erro na requisição:", erro);
      alert("Erro de conexão ao tentar cancelar. Verifique o console.");
    }
  });
}

// ────────────────────────────────────────────────
//  MODAL – Informações / status do pedido
// (mantido exatamente igual ao seu)
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

/* ================================================ */
/* ADIÇÃO NECESSÁRIA: CARREGAMENTO DAS LISTAS       */
/* Preenche as listas PREPARANDO e PRONTO           */
/* ================================================ */
async function atualizarPedidosStatus() {
  try {
    const resposta = await fetch(`${API_BASE}/api/public/pedidos/painel`);
    if (!resposta.ok) throw new Error("Erro ao buscar status");

    const dados = await resposta.json();

    const listaPreparo = document.getElementById("lista-preparo");
    const listaPronto = document.getElementById("lista-pronto");

    listaPreparo.innerHTML = "";
    listaPronto.innerHTML = "";

    dados.forEach(pedido => {
      const li = document.createElement("li");
      li.textContent = `Pedido #${pedido.numeroRetirada} - ${pedido.nomeAluno}`;

      if (pedido.status === "AGUARDANDO") {
        listaPreparo.appendChild(li);
      } else if (pedido.status === "PRONTO") {
        listaPronto.appendChild(li);
      }
    });
  } catch (erro) {
    console.error("Erro ao carregar status dos pedidos:", erro);
  }
}

// Inicia o carregamento das listas ao abrir a página
document.addEventListener("DOMContentLoaded", () => {
  atualizarPedidosStatus();
  setInterval(atualizarPedidosStatus, 5000);//Atualiza painel de 5 em 5 segundos
});