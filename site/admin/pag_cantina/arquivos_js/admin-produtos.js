const API_URL = 'https://cantina-api-rlqm.onrender.com/api/admin';

const AUTH_HEADER = {
    'Authorization': 'Basic ' + btoa('admin:123'),
    'Content-Type': 'application/json'
};

let dados_produtos;
let dados_categorias;

let tabela = document.getElementById('bodyTabela');
const select = document.getElementById('categoria');

// Coloca as promoções já cadastradas para apresentação
AtualizarTabela();

// Busca e apresenta as categorias já cadastradas
ListarCategorias();

// Evento que coloca a imagem recem recebida do upload visivel durante a edição
document.getElementById('enviarFoto').addEventListener('change', function (event) {
    const arquivo = event.target.files[0];
    const apresentador = document.getElementById('imgCadastrada');

    if (!arquivo.type.startsWith('image/')) {
        alert('Selecione um arquivo de imagem válido.');
        event.target.value = '';
        return;
    } else {
        apresentador.src = arquivo.name;
    }
});

/* Função chamada ao clicar no botão Cadastrar produto
   Responsável por identificar os campos e zerar os valores para cadastrar um produto */
function Cadastrar() {
    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    enviarFoto = document.getElementById('enviarFoto');
    preco = document.getElementById('preco');
    imgCadastrada = document.getElementById('imgCadastrada');
    categoria = document.getElementById('categoria');
    titulo = document.getElementById('tituloVerificar');

    // Coloca os valores do Pupup como iniciais
    id.value = '';
    nome.value = '';
    descricao.value = '';
    disponibilidade.value = 1;
    preco.value = 0;
    imgCadastrada.src = '../imgs/foto-padrao-produto.svg';
    categoria.value = -1;
    titulo.innerText = 'Cadastrar novo produto';

    // Abre o Pupup Verificar
    window.location.assign("#popupVerificar");
}

/* Função chamada ao clicar no botão de ação da lupa
   Responsável por identificar os campos e apresentar os valores cadastrados do produto */
function Visualizar(num) {
    // Pega os campus dos Pupup Visualizar
    nome = document.getElementById('labelNome');
    descricao = document.getElementById('labelDescricao');
    disponibilidade = document.getElementById('labelDisponibilidade'); // => 0 ou 1: Representa status
    preco = document.getElementById('labelPreco');
    imgCadastrada = document.getElementById('visualizarImgCadastrada');
    categoria = document.getElementById('labelCategoria');
    titulo = document.getElementById('tituloVisualizar');

    // Escreve os dados da promoção no Pupup
    nome.innerText = dados_produtos[num].nome;
    descricao.innerText = dados_produtos[num].descricao;
    disponibilidade.innerText = dados_produtos[num].ativo ? "Ativo" : "Inativo";
    preco.innerText = dados_produtos[num].preco;
    imgCadastrada.src = dados_produtos[num].imagemUrl;
    categoria.innerHTML = dados_produtos[num].categoria.nome;
    titulo.innerText = `Visualização do produto ${dados_produtos[num].nome}`;

    // Abre o Pupup Visualizar
    window.location.assign("#popupVisualizar");
}

/* Função chamada ao clicar no botão de ação do lápis
   Responsável por identificar os campos e colocar os valores cadastrados nos campos do produto */
function Editar(num) {
    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    enviarFoto = document.getElementById('enviarFoto');
    preco = document.getElementById('preco');
    imgCadastrada = document.getElementById('imgCadastrada');
    categoria = document.getElementById('categoria');
    titulo = document.getElementById('tituloVerificar');

    let dado = dados_produtos[num].categoria;

    // Escreve os dados do produto nos campos do Pupup
    id.value = dados_produtos[num].id;
    nome.value = dados_produtos[num].nome;
    descricao.value = dados_produtos[num].descricao;
    disponibilidade.value = dados_produtos[num].ativo ? 1 : 0;
    preco.value = parseFloat(dados_produtos[num].preco);
    imgCadastrada.src = dados_produtos[num].imagemUrl;
    categoria.value = `{ "ativo": ${dado.ativo}, "id": ${dado.id}, "nome": "${dado.nome}" }`;
    titulo.innerText = `Edição do produto ${dados_produtos[num].nome}`;

    // Abre o Pupup Verificar
    window.location.assign("#popupVerificar");
}

/* Função chamada ao clicar no botão de ação da lixeira
   Responsável por deletar um produto selecionado */
async function Excluir(num) {
    if (confirm("Tem certeza que deseja excluir esse produto?")) {
        await fetch(`${API_URL}/produtos/${dados_produtos[num].id}`, {
            method: 'DELETE',
            headers: AUTH_HEADER
        });
        AtualizarTabela();
    }
}

/* Função chamada ao clicar no botão salvar de uma edição ou criação de um produto
   Responsável por salvar os dados do produto editado ou criado */
async function Salvar() {
    let botao_salvar = document.getElementById('salvarVerificacao').innerHTML;

    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado').value;
    nome = document.getElementById('nome').value;
    descricao = document.getElementById('descricao').value;
    ativo = parseInt(document.getElementById('disponibilidade').value) ? true : false; // => 0 ou 1: Representa status
    enviarFoto = document.getElementById('enviarFoto');
    preco = parseFloat(document.getElementById('preco').value);
    categoria = JSON.parse(document.getElementById('categoria').value); //////
    imagemUrl = document.getElementById('imgCadastrada').src;
    
    // Verifica se foi selecionada uma categoria para o produto
    if (categoria < 0) {
        alert('Nenhuma categoria selecionada para o produto, selecione uma categoria antes de salvar.');
    // Verifica se foi selecionado um preço para o produto
    } else if (preco < 1) {
        alert('O preço do produto não pode ser 0, selecione um preço valido antes de salvar.');
    } else {
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/produtos/${id}` : API_URL+'/produtos';

        try {
            resposta = await fetch(url, {
                method: metodo,
                headers: AUTH_HEADER,
                body: JSON.stringify({ nome, descricao, ativo, preco, categoria, imagemUrl })
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

        // Atualiza as promoções cadastradas para apresentação
        AtualizarTabela();
    }
}

// Função de atualização dos dados da tabela
async function AtualizarTabela() {
    tabela.innerHTML = 'A carregar ...';

    const resposta = await fetch(API_URL+'/produtos', { 
        method: 'GET', 
        headers: AUTH_HEADER 
    });

    dados_produtos = await resposta.json();

    let produtos_html = ``;
    let contador_linhas = 0;

    dados_produtos.forEach((dado) => {
        // Html da linha de uma categoria
        produtos_html += `<tr id="idLinha${dado.id}">
            <input type="number" value='${contador_linhas}' id="idProduto${dado.id}" hidden>
            <td>${dado.nome}</td>
            <td>${dado.descricao}</td>
            <td class="areaStatus"><span style="background-color: ${dado.ativo ? "var(--verde-secundario)" : "#ffd600"};">${dado.ativo ? "Ativo" : "Inativo"}</span></td>
            <td class="areaBotoes">
                <button class="botaoVisualizar" onclick="Visualizar(${contador_linhas})"><img src="../imgs/icone-lupa.svg" alt="Visualizar" width="25px" height="25px"></button>
                <button class="botaoEditar" onclick="Editar(${contador_linhas})"><img src="../imgs/icone-lapis.svg" alt="Editar" width="25px" height="25px"></button>
                <button class="botaoExcluir" onclick="Excluir(${contador_linhas})"><img src="../imgs/icone-lixeira.svg" alt="Excluir" width="25px" height="25px"></button>
            </td>
        </tr>`

        contador_linhas++;
    });

    // Passagem do texto gerado das linhas da tebela para o html
    tabela.innerHTML = produtos_html;
}

// Busca e apresenta as categorias já cadastradas
async function ListarCategorias() {
    const resposta = await fetch(API_URL+'/categorias', { 
        method: 'GET', 
        headers: AUTH_HEADER 
    });

    dados_categorias = await resposta.json();

    let promocoes_html = ``;
    let contador_linhas = 0;

    // Geração das linhas da tabela
    dados_categorias.forEach((dado) => {
        const option = document.createElement("option");
        option.value = `{ "ativo": ${dado.ativo}, "id": ${dado.id}, "nome": "${dado.nome}" }`;

        option.textContent = dado.nome;
        if (dado.ativo) {
            option.style.backgroundColor = 'var(--verde-secundario)';
        } else {
            option.style.backgroundColor = '#ffd600';
        };
        select.appendChild(option);
       
        contador_linhas++;
    });
}