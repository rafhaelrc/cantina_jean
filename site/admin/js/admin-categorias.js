const API_URL = 'https://cantina-api-rlqm.onrender.com/api/admin/categorias';

const AUTH_HEADER = {
    'Authorization': 'Basic ' + btoa('admin:123'),
    'Content-Type': 'application/json'
};

let dados;

let tabela = document.getElementById('bodyTabela');

// Coloca as categorias já cadastradas para apresentação
AtualizarTabela();

/* Função chamada ao clicar no botão Cadastrar categoria
   Responsável por identificar os campos e zerar os valores para cadastrar uma categoria */
function Cadastrar() {
    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    titulo = document.getElementById('tituloVerificar');

    // Coloca os valores do Pupup como iniciais
    id.value = '';
    nome.value = '';
    disponibilidade.value = 1;
    titulo.innerText = 'Cadastrar nova categoria';
    
    // Abre o Pupup Verificar
    window.location.assign("#popupVerificar");
}

/* Função chamada ao clicar no botão de ação da lupa
   Responsável por identificar os campos e apresentar os valores cadastrados da categoria */
function Visualizar(num) {
    // Pega os campus dos Pupup Visualizar
    nome = document.getElementById('labelNome');
    disponibilidade = document.getElementById('labelDisponibilidade'); // => 0 ou 1: Representa status
    titulo = document.getElementById('tituloVisualizar');

    // Escreve os dados da categoria no Pupup
    nome.innerText = dados[num].nome;
    disponibilidade.innerText = dados[num].ativo ? "Ativo" : "Inativo";
    titulo.innerText = `Visualização da categoria ${dados[num].nome}`;

    // Abre o Pupup Visualizar
    window.location.assign("#popupVisualizar");
}

/* Função chamada ao clicar no botão de ação do lápis
   Responsável por identificar os campos e colocar os valores cadastrados nos campos da categoria */
function Editar(num) {
    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    titulo = document.getElementById('tituloVerificar');

    // Escreve os dados da categoria nos campos do Pupup
    id.value = dados[num].id;
    nome.value = dados[num].nome;
    disponibilidade.value = dados[num].ativo ? 1 : 0;
    titulo.innerText = `Edição da categoria ${dados[num].nome}`;

    // Abre o Pupup Verificar
    window.location.assign("#popupVerificar");
}

/* Função chamada ao clicar no botão de ação da lixeira
   Responsável por deletar uma categoria selecionada */
async function Excluir(num) {
    if (confirm("Tem certeza que deseja excluir essa categoria?")) {
        await fetch(`${API_URL}/${dados[num].id}`, {
            method: 'DELETE',
            headers: AUTH_HEADER
        });
        AtualizarTabela();
    }
}

/* Função chamada ao clicar no botão salvar de uma edição ou criação de uma categoria
   Responsável por salvar os dados da categoria editada ou criada */
async function Salvar() {
    let botao_salvar = document.getElementById('salvarVerificacao').innerHTML;

    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado').value;
    nome = document.getElementById('nome').value;
    ativo = parseInt(document.getElementById('disponibilidade').value) ? true : false; // => 0 ou 1: Representa status

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
        resposta = await fetch(url, {
            method: metodo,
            headers: AUTH_HEADER,
            body: JSON.stringify({ nome, ativo })
        });

        if (resposta.ok) {
            AtualizarTabela();
        } else {
            alert("Erro ao salvar!");
        }

    } catch (error) {
        console.error(error);
    }

    // Fecha o Pupup atual
    window.location.assign("#");
}

// Função de atualização dos dados da tabela
async function AtualizarTabela() {
    tabela.innerHTML = '<td colspan="8" id="linhaCarregamento"><div>A carregar ...</div></td>';

    const resposta = await fetch(API_URL, { 
        method: 'GET', 
        headers: AUTH_HEADER 
    });

    dados = await resposta.json();

    let categorias_html = ``;
    let contador_linhas = 0;

    // Geração das linhas da tabela
    dados.forEach((dado) => {
        // Html da linha de uma categoria
        categorias_html += `<tr id="idLinha${dado.id}">
            <input type="number" value='${contador_linhas}' id="idProduto${dado.id}" hidden>
            <td>${dado.nome}</td>
            <td class="areaStatus"><span style="background-color: ${dado.ativo ? "var(--verde-secundario)" : "#ffd600"};">${dado.ativo ? "Ativo" : "Inativo"}</span></td>
            <td class="areaBotoes">
                <button class="botaoVisualizar" onclick="Visualizar(${contador_linhas})"><img src="img/icone-lupa.svg" alt="Visualizar" width="20px"></button>
                <button class="botaoEditar" onclick="Editar(${contador_linhas})"><img src="img/icone-lapis.svg" alt="Editar" width="20px"></button>
                <button class="botaoExcluir" onclick="Excluir(${contador_linhas})"><img src="img/icone-lixeira.svg" alt="Excluir" width="20px"></button>
            </td>
        </tr>`

        contador_linhas++;
    });

    // Passagem do texto gerado das linhas da tebela para o html
    tabela.innerHTML = categorias_html;
}