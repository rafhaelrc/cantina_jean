const API_BASE = "https://cantina-api-rlqm.onrender.com";

async function logar() {
    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');
    const btn = document.getElementById('btnEntrar');

    const usuario = usuarioInput.value;
    const senha = senhaInput.value;

    // 1. Cria o token Basic Auth (Base64)
    // btoa converte string para Base64
    const token = 'Basic ' + btoa(usuario + ":" + senha);

    // Efeito visual de carregando
    const textoOriginal = btn.innerText;
    btn.innerText = "Autenticando...";
    btn.disabled = true;
    btn.style.backgroundColor = "#ccc"; // Cinza enquanto carrega

    try {
        // 2. Tenta bater num endpoint protegido para testar a senha
        // Vamos usar o status-loja que é leve
        const resposta = await fetch(`${API_BASE}/api/admin/pedidos/status-loja`, {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (resposta.ok) {
            // === SUCESSO ===
            // 3. Salva o token na sessão do navegador
            sessionStorage.setItem('tokenAdmin', token);
            
            // 4. Redireciona para o painel principal
            window.location.href = "admin-home.html"; 
            
        } else {
            // === ERRO (Senha errada) ===
            alert('Usuário ou senha incorretos!');
        }

    } catch (erro) {
        console.error(erro);
        alert('Erro de conexão com o servidor.');
    } finally {
        // Restaura o botão (seja sucesso ou erro)
        btn.innerText = textoOriginal;
        btn.disabled = false;
        btn.style.backgroundColor = ""; 
    }
}