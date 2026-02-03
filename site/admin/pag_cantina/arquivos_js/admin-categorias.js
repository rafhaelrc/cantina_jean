let tabela = document.getElementById('bodyTabela');
let numero_categorias = 4;

// Lista fictícia de objetos representando as categorias já cadastradas
let categorias = {
    0: {
        id: 0,
        nome: 'Lanches',
        descricao: 'Categoria de lanches',
        status: 1,
    },

    1: {
        id: 1,
        nome: 'Doces',
        descricao: 'Categoria de doces',
        status: 1,
    },

    2: {
        id: 2,
        nome: 'Bebidas',
        descricao: 'Categoria de bebidas',
        status: 1,
    },

    3: {
        id: 4,
        nome: 'Sobremesas',
        descricao: 'Categoria de sobremesas',
        status: 0,
    },
};

// Coloca as categorias já cadastradas para apresentação
AtualizarTabela();

/* Função chamada ao clicar no botão Cadastrar categoria
   Responsável por identificar os campos e zerar os valores para cadastrar uma categoria */
function Cadastrar() {
    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    titulo = document.getElementById('tituloVerificar');

    // Coloca os valores do Pupup como iniciais
    id.value = numero_categorias;
    nome.value = '';
    descricao.value = '';
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
    descricao = document.getElementById('labelDescricao');
    disponibilidade = document.getElementById('labelDisponibilidade'); // => 0 ou 1: Representa status
    titulo = document.getElementById('tituloVisualizar');

    // Escreve os dados da categoria no Pupup
    nome.innerText = categorias[num].nome;
    descricao.innerText = categorias[num].descricao;
    disponibilidade.innerText = categorias[num].status ? "Ativo" : "Inativo";
    titulo.innerText = `Visualização da categoria ${categorias[num].nome}`;

    // Abre o Pupup Visualizar
    window.location.assign("#popupVisualizar");
}

/* Função chamada ao clicar no botão de ação do lápis
   Responsável por identificar os campos e colocar os valores cadastrados nos campos da categoria */
function Editar(num) {
    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    titulo = document.getElementById('tituloVerificar');

    // Escreve os dados da categoria nos campos do Pupup
    id.value = num;
    nome.value = categorias[num].nome;
    descricao.value = categorias[num].descricao;
    disponibilidade.value = categorias[num].status;
    titulo.innerText = `Edição da categoria ${categorias[num].nome}`;

    // Abre o Pupup Verificar
    window.location.assign("#popupVerificar");
}

/* Função chamada ao clicar no botão de ação da lixeira
   Responsável por deletar uma categoria selecionada */
function Excluir(num) {
    if (confirm("Tem certeza que deseja excluir essa categoria?")) {
        delete categorias[num];
        a = document.getElementById('idLinha' + num);
        a.innerHTML = '';
    }
}

/* Função chamada ao clicar no botão salvar de uma edição ou criação de uma categoria
   Responsável por salvar os dados da categoria editada ou criada */
function Salvar() {
    // Pega os campos dos Pupup Verificar
    num = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status

    // Cadastra os dados da categoria na lista fictícia de categorias
    categorias[parseInt(num.value)] = {
        id: parseInt(num.value),
        nome: nome.value,
        descricao: descricao.value ,
        status: parseInt(disponibilidade.value),
    };

    // Aumenta o contador de quantidade de categorias se for uma criação de categoria
    if (numero_categorias == parseInt(num.value)) {
        numero_categorias++;
    }

    // Fecha o Pupup atual
    window.location.assign("#");

    // Atualiza as promoções cadastradas para apresentação
    AtualizarTabela();
}

// Função de atualização dos dados da tabela
function AtualizarTabela() {
    let promocoes_html = ``;

    // Geração das linhas da tabela
    for (let key in Object.keys(categorias)) {
        let i = Object.keys(categorias)[key];

        // Html da linha de uma categoria
        promocoes_html += `<tr id="idLinha${i}">
            <input type="number" value='${i}' id="idProduto${i}" hidden>
            <td>${categorias[i].nome}</td>
            <td>${categorias[i].descricao}</td>
            <td class="areaStatus"><span style="background-color: ${categorias[i].status ? "var(--verde-secundario)" : "#ffd600"};">${categorias[i].status ? "Ativo" : "Inativo"}</span></td>
            <td class="areaBotoes">
                <button class="botaoVisualizar" onclick="Visualizar(${i})"><img src="../imgs/icone-lupa.svg" alt="Visualizar" width="25px" height="25px"></button>
                <button class="botaoEditar" onclick="Editar(${i})"><img src="../imgs/icone-lapis.svg" alt="Editar" width="25px" height="25px"></button>
                <button class="botaoExcluir" onclick="Excluir(${i})"><img src="../imgs/icone-lixeira.svg" alt="Excluir" width="25px" height="25px"></button>
            </td>
        </tr>`
    };

    // Passagem do texto gerado das linhas da tebela para o html
    tabela.innerHTML = promocoes_html;
}