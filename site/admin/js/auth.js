// 1. Verifica se o token existe no sessionStorage
const token = sessionStorage.getItem("tokenAdmin");

// 2. Se NÃO tiver token, chuta de volta para o login
if (!token) {
    alert("Acesso negado! Você precisa fazer login.");
    // Redireciona para o index.html (que é a tela de login)
    window.location.href = "admin-login.html"; 
}

// 3. (Opcional) Função de Sair para usar nos botões de Logout
function sair() {
    sessionStorage.removeItem("tokenAdmin");
    window.location.href = "admin-login.html";
}