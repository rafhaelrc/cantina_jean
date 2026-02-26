const API_BASE = "https://cantina-api-rlqm.onrender.com";

// =====================================================
// UX: Mensagens dentro do card + Mostrar/Ocultar senha
// =====================================================

/**
 * Mostra uma mensagem no card (erro ou ok).
 * @param {string} texto - Mensagem a exibir.
 * @param {"erro"|"ok"} tipo - Estilo da mensagem.
 */
function mostrarMensagemLogin(texto, tipo = "erro") {
  const msg = document.getElementById("msgLogin");
  if (!msg) return;

  msg.classList.remove("erro", "ok");
  msg.classList.add(tipo);
  msg.textContent = texto;
  msg.style.display = "block";
}

/**
 * Esconde a mensagem do card.
 */
function esconderMensagemLogin() {
  const msg = document.getElementById("msgLogin");
  if (!msg) return;

  msg.style.display = "none";
  msg.textContent = "";
  msg.classList.remove("erro", "ok");
}

/**
 * Ativa o botão de mostrar/ocultar senha.
 */
function configurarToggleSenha() {
  const inputSenha = document.getElementById("senha");
  const btn = document.getElementById("btnToggleSenha");
  if (!inputSenha || !btn) return;

  btn.addEventListener("click", () => {
    const estaOculta = inputSenha.type === "password";
    inputSenha.type = estaOculta ? "text" : "password";
    btn.setAttribute("aria-label", estaOculta ? "Ocultar senha" : "Mostrar senha");
    btn.textContent = estaOculta ? "🙈" : "👁";
    inputSenha.focus();
  });
}

/**
 * Controla estado visual do botão "Entrar".
 * @param {HTMLButtonElement} btn
 * @param {boolean} carregando
 */
function definirCarregandoBotao(btn, carregando) {
  if (!btn) return;

  if (carregando) {
    btn.dataset.textoOriginal = btn.innerText;
    btn.innerText = "Autenticando...";
    btn.disabled = true;
  } else {
    btn.innerText = btn.dataset.textoOriginal || "ENTRAR";
    btn.disabled = false;
  }
}

// =====================================================
// LOGIN (autenticação)
// =====================================================

async function logar() {
  const usuarioInput = document.getElementById("usuario");
  const senhaInput = document.getElementById("senha");
  const btn = document.getElementById("btnEntrar");

  const usuario = (usuarioInput?.value || "").trim();
  const senha = senhaInput?.value || "";

  esconderMensagemLogin();

  // Validação básica
  if (!usuario || !senha) {
    mostrarMensagemLogin("Preencha usuário e senha para continuar.", "erro");
    return;
  }

  // Cria token Basic Auth (Base64)
  const token = "Basic " + btoa(usuario + ":" + senha);

  // Efeito visual de carregando
  definirCarregandoBotao(btn, true);

  try {
    // Tenta bater num endpoint protegido para validar as credenciais
    const resposta = await fetch(`${API_BASE}/api/admin/pedidos/status-loja`, {
      method: "GET",
      headers: {
        Authorization: token
      }
    });

    if (resposta.ok) {
      // Sucesso: salva token e redireciona
      sessionStorage.setItem("tokenAdmin", token);

      mostrarMensagemLogin("Login realizado! Redirecionando...", "ok");

      // Pequeno delay só pra dar tempo de ver a mensagem
      setTimeout(() => {
        window.location.href = "admin-home.html";
      }, 450);

      return;
    }

    // Erros comuns de autenticação
    if (resposta.status === 401 || resposta.status === 403) {
      mostrarMensagemLogin("Usuário ou senha incorretos.", "erro");
      return;
    }

    // Outros erros HTTP
    mostrarMensagemLogin(`Falha ao autenticar (HTTP ${resposta.status}).`, "erro");
  } catch (erro) {
    console.error(erro);
    mostrarMensagemLogin("Erro de conexão com o servidor. Verifique sua internet.", "erro");
  } finally {
    definirCarregandoBotao(btn, false);
  }
}

// =====================================================
// INIT
// =====================================================

window.addEventListener("DOMContentLoaded", () => {
  configurarToggleSenha();

  // Ao começar a digitar, some com a mensagem antiga
  const usuario = document.getElementById("usuario");
  const senha = document.getElementById("senha");

  [usuario, senha].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => esconderMensagemLogin());
  });
});