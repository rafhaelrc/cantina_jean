// ────────────────────────────────────────────────
//  FORMULÁRIO – Fale Conosco
// ────────────────────────────────────────────────
// Evento acionado quando o usuário clica em "Enviar"
document.getElementById("form-contato").addEventListener("submit", (e) => {
  e.preventDefault(); // Impede que a página recarregue (comportamento padrão do form)

  // Pega os valores digitados nos campos
  const nome = document.getElementById("nome").value;
  const whatsapp = document.getElementById("whatsapp").value;
  const mensagem = document.getElementById("mensagem").value;

  // Validação simples: verifica se todos os campos estão preenchidos
  if (!nome || !whatsapp || !mensagem) {
    alert("Preencha todos os campos!");
    return; // Para a execução se faltar algo
  }

  // Mostra mensagem de sucesso (igual ao original)
  alert(`Obrigado, ${nome}! Sua mensagem foi enviada.`);

  // Limpa todos os campos do formulário para nova mensagem
  e.target.reset();
});