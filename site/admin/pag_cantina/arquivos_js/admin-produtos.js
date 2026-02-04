let tabela = document.getElementById('bodyTabela');
const select = document.getElementById('categoria');
let numero_produtos = 5;

// Lista fictícia de objetos representando os produtos já cadastrados
let produtos = {
    0: {
        id: 0,
        nome: 'COCA 600 ML',
        categoria: 2,
        descricao: 'Garrafa de Coca-Cola de 600 ml',
        foto: '../imgs/icone-lapis.svg',
        status: 1,
        preco: 5,
    },

    1: {
        id: 1,
        nome: 'Torrada completa',
        categoria: 0,
        descricao: 'Torrada com ovo, queijo, presunto, salada e tomate',
        foto: '../imgs/icone-lupa.svg',
        status: 1,
        preco: 6,
    },

    2: {
        id: 2,
        nome: 'Coxinha de frango',
        categoria: 0,
        descricao: 'Coxinha de frango frita',
        foto: '../imgs/icone-lapis.svg',
        status: 1,
        preco: 5,
    },

    3: {
        id: 3,
        nome: 'Brigadeiro',
        categoria: 1,
        descricao: 'Brigadeiro caseiro',
        foto: '../imgs/foto-padrao-produto.svg',
        status: 1,
        preco: 3,
    },

    4: {
        id: 4,
        nome: 'Morango do amorcocacola + refl',
        categoria: 1,
        descricao: 'Morango com Cobertura caramelizada',
        foto: '../imgs/foto-padrao-produto.svg',
        status: 0,
        preco: 7,
    },
};

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
    id.value = numero_produtos;
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
    nome.innerText = produtos[num].nome;
    descricao.innerText = produtos[num].descricao;
    disponibilidade.innerText = produtos[num].status ? "Ativo" : "Inativo";
    preco.innerText = produtos[num].preco;
    imgCadastrada.src = produtos[num].foto;
    categoria.innerHTML = categorias[produtos[num].categoria].nome;
    titulo.innerText = `Visualização do produto ${produtos[num].nome}`;

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

    // Escreve os dados da promoção nos campos do Pupup
    id.value = num;
    nome.value = produtos[num].nome;
    descricao.value = produtos[num].descricao;
    disponibilidade.value = produtos[num].status;
    preco.value = produtos[num].preco;
    imgCadastrada.src = produtos[num].foto;
    categoria.value = produtos[num].categoria
    titulo.innerText = `Edição do produto ${produtos[num].nome}`;

    // Abre o Pupup Verificar
    window.location.assign("#popupVerificar");
}

/* Função chamada ao clicar no botão de ação da lixeira
   Responsável por deletar um produto selecionado */
function Excluir(num) {
    if (confirm("Tem certeza que deseja excluir esse produto?")) {
        delete produtos[num];
        a = document.getElementById('idLinha' + num);
        a.innerHTML = '';
    }
}

/* Função chamada ao clicar no botão salvar de uma edição ou criação de um produto
   Responsável por salvar os dados do produto editado ou criado */
function Salvar() {
    // Pega os campos dos Pupup Verificar
    num = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    enviarFoto = document.getElementById('enviarFoto');
    preco = document.getElementById('preco');
    categoria = document.getElementById('categoria');
    imgCadastrada = document.getElementById('imgCadastrada');

    // Verifica se foi selecionada uma categoria para o produto
    if (categoria.value == -1) {
        alert('Nenhuma categoria selecionada para o produto, selecione uma categoria antes de salvar.');
    // Verifica se foi selecionado um preço para o produto
    } else if (preco.value < 1) {
        alert('O preço do produto não pode ser 0, selecione um preço valido antes de salvar.');
    } else {
        // Se as condições forem aceitas, cadastra os dados do produto na lista fictícia de produtos
        produtos[parseInt(num.value)] = {
            id: parseInt(num.value),
            nome: nome.value,
            descricao: descricao.value,
            foto: imgCadastrada.src,
            status: parseInt(disponibilidade.value),
            preco: parseFloat(preco.value),
            categoria: parseInt(categoria.value),
        };

        // Aumenta o contador de quantidade de produtos se for uma criação de produto
        if (numero_produtos == parseInt(num.value)) {
            numero_produtos++;
        }

        // Fecha o Pupup atual
        window.location.assign("#");

        // Atualiza as promoções cadastradas para apresentação
        AtualizarTabela();
    }
}

// Função de atualização dos dados da tabela
function AtualizarTabela() {
    let produtos_html = ``;

    // Geração das linhas da tabela
    for (let key in Object.keys(produtos)) {
        let i = Object.keys(produtos)[key];

        // Html da linha de um produto
        produtos_html += `<tr id="idLinha${i}">
            <input type="number" value='${i}' id="idProduto${i}" hidden>
            <td>${produtos[i].nome}</td>
            <td>${produtos[i].descricao}</td>
            <td class="areaStatus"><span style="background-color: ${produtos[i].status ? "var(--verde-secundario)" : "#ffd600"};">${produtos[i].status ? "Ativo" : "Inativo"}</span></td>
            <td class="areaBotoes">
                <button class="botaoVisualizar" onclick="Visualizar(${i})"><img src="../imgs/icone-lupa.svg" alt="Visualizar" width="25px" height="25px"></button>
                <button class="botaoEditar" onclick="Editar(${i})"><img src="../imgs/icone-lapis.svg" alt="Editar" width="25px" height="25px"></button>
                <button class="botaoExcluir" onclick="Excluir(${i})"><img src="../imgs/icone-lixeira.svg" alt="Excluir" width="25px" height="25px"></button>
            </td>
        </tr>`
    };

    // Passagem do texto gerado das linhas da tebela para o html
    tabela.innerHTML = produtos_html;
}

// Busca e apresenta as categorias já cadastradas
function ListarCategorias() {
    for (let kay in Object.keys(categorias)) {
        const option = document.createElement("option");
        option.value = categorias[kay].id;
        option.textContent = categorias[kay].nome;
        select.appendChild(option);
    }
}