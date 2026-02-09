let tabela = document.getElementById('bodyTabela');
const select = document.getElementById('listaProdutos');
let numero_promocoes = 5;

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

// Lista fictícia de objetos representando as promoções já cadastradas
let promocoes = {
    0: {
        id: 0,
        nome: 'cocacola + torrada por 10 reais',
        descricao: 'Garrafa de Coca-Cola de 200 ml com torrada completa',
        produtos_lista: ['0','1'], // Lista de produtos da promoção por id
        validade: 1, // Valor em horas
        foto: '../imgs/icone-lapis.svg',
        status: 1,
        preco: 10,
    },

    1: {
        id: 1,
        nome: 'Torrada completa',
        descricao: 'Torrada com ovo, queijo, presunto, salada e tomate',
        produtos_lista: ['2','4'], // Lista de produtos da promoção
        validade: 1, // Valor em horas
        foto: '../imgs/icone-lupa.svg',
        status: 1,
        preco: 10,
    },

    2: {
        id: 2,
        nome: 'Coxinha de frango',
        descricao: 'Coxinha de frango frita',
        produtos_lista: ['4'], // Lista de produtos da promoção
        validade: 1, // Valor em horas
        foto: '../imgs/icone-lapis.svg',
        status: 1,
        preco: 5,
    },

    3: {
        id: 3,
        nome: 'cocacola + torrada por 10 reais',
        descricao: 'Lata de Coca-Cola de 200 ml com torrada completa',
        produtos_lista: ['3'], // Lista de produtos da promoção
        validade: 1, // Valor em horas
        foto: '../imgs/foto-padrao-promocao.svg',
        status: 1,
        preco: 2,
    },

    4: {
        id: 4,
        nome: 'Morango do amor + Brigadeiro',
        descricao: 'Morango com Cobertura caramelizada',
        produtos_lista: ['3','4'], // Lista de produtos da promoção
        validade: 1, // Valor em horas
        foto: '../imgs/foto-padrao-promocao.svg',
        status: 0,
        preco: 4,
    },
};

// Coloca as promoções já cadastradas para apresentação
AtualizarTabela();

// Busca e apresenta os produtos já cadastrados
ListarProdutos();

const pesquisarProduto = document.getElementById('pesquisarProduto');
const listaProdutos = document.getElementById('listaProdutos');
const opcoes = Array.from(listaProdutos.getElementsByTagName('option'));

// Evento que possibilita pesquisa de itens
pesquisarProduto.addEventListener('input', function() {
    const texto_pesquisado = this.value.toLowerCase();
    let com_resultados = false;
    let semResultado = document.getElementById('semResultado');

    opcoes.forEach(opcao => {
        if (opcao.textContent.toLowerCase().includes(texto_pesquisado)) {
            opcao.style.display = '';
            com_resultados = true;
        } else {
            opcao.style.display = 'none';
        }
    });

    if (!com_resultados && pesquisarProduto !== '') {
        semResultado.style.display = '';
    } else {
        semResultado.style.display = 'none';
    }
});

// Evento que coloca a imagem recem recebida do upload visivel durante uma edição
document.getElementById('enviarFoto').addEventListener('change', function(event) {
    const arquivo = event.target.files[0];
    const apresentador = document.getElementById('imgCadastrada');

    // Verificação para imagens válidas
    if (!arquivo.type.startsWith('image/')) {
        alert('Selecione um arquivo de imagem válido.');
        event.target.value = '';
        return;
    } else {
        apresentador.src = arquivo.name; 
    }
});

/* Função chamada ao clicar no botão Cadastrar promoção
   Responsável por identificar os campos e zerar os valores para cadastrar uma promoção */
function Cadastrar() {
    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    preco = document.getElementById('preco');
    imgCadastrada = document.getElementById('imgCadastrada');
    titulo = document.getElementById('tituloVerificar');
    produtos_lista = document.getElementById('listaProdutos');
    validade = document.getElementById('validade');

    // Coloca os valores do Pupup como iniciais
    id.value = numero_promocoes;
    nome.value = '';
    descricao.value = '';
    disponibilidade.value = 1;
    preco.value = 0;
    imgCadastrada.src = '../imgs/foto-padrao-promocao.svg';
    titulo.innerText = 'Cadastrar nova promoção';
    validade.value = 1;

    // Reseta a lista de produtos selecionados
    ResetarListaProdutos(produtos_lista.options);

    // Abre o Pupup Verificar
    window.location.assign("#popupVerificar");
}

/* Função chamada ao clicar no botão de ação da lupa
   Responsável por identificar os campos e apresentar os valores cadastrados da promoção */
function Visualizar(num) {
    // Pega os campus dos Pupup Visualizar
    nome = document.getElementById('labelNome');
    descricao = document.getElementById('labelDescricao');
    disponibilidade = document.getElementById('labelDisponibilidade'); // => 0 ou 1: Representa status
    preco = document.getElementById('labelPreco');
    imgCadastrada = document.getElementById('visualizarImgCadastrada');
    titulo = document.getElementById('tituloVisualizar');
    produtos_lista = document.getElementById('labelListaProdutos');
    validade = document.getElementById('labelValidade');

    // Escreve os dados da promoção no Pupup
    nome.innerText = promocoes[num].nome;
    descricao.innerText = promocoes[num].descricao;
    disponibilidade.innerText = promocoes[num].status ? "Ativo" : "Inativo";
    preco.innerText = promocoes[num].preco;
    imgCadastrada.src = promocoes[num].foto;
    titulo.innerText = `Visualização da promoção ${promocoes[num].nome}`;
    validade.innerText = promocoes[num].validade;

    // Escreve específicamente os produtos da promoção no Pupup
    let produtos_html = '';
    promocoes[num].produtos_lista.forEach((produto) => {
        produtos_html += `<p class="itensListados">${produtos[produto].nome}</p>`;
    });
    produtos_lista.innerHTML= produtos_html;

    // Abre o Pupup Visualizar
    window.location.assign("#popupVisualizar");
}

/* Função chamada ao clicar no botão de ação do lápis
   Responsável por identificar os campos e colocar os valores cadastrados nos campos da promoção */
function Editar(num) {
    // Pega os campos dos Pupup Verificar
    id = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    preco = document.getElementById('preco');
    imgCadastrada = document.getElementById('imgCadastrada');
    titulo = document.getElementById('tituloVerificar');
    produtos_lista = document.getElementById('listaProdutos');
    validade = document.getElementById('validade');

    // Escreve os dados da promoção nos campos do Pupup
    id.value = num;
    nome.value = promocoes[num].nome;
    descricao.value = promocoes[num].descricao;
    disponibilidade.value = promocoes[num].status;
    preco.value = promocoes[num].preco;
    imgCadastrada.src = promocoes[num].foto;
    titulo.innerText = `Edição da promoção ${promocoes[num].nome}`;
    validade.value = promocoes[num].validade;

    // Reseta a lista de produtos selecionados
    ResetarListaProdutos(produtos_lista.options);

    // Seleciona os produtos já cadastrados na propaganda
    for (let opcao of produtos_lista.options) {
        for (let produto of promocoes[num].produtos_lista) {
            if (opcao.value == produto) {
                opcao.selected = true;
            }
        }
    }

    // Abre o Pupup Verificar
    window.location.assign("#popupVerificar");
}

/* Função chamada ao clicar no botão de ação da lixeira
   Responsável por deletar uma promoção selecionada */
function Excluir(num) {
    if (confirm("Tem certeza que deseja excluir essa promoção?")) {
        delete promocoes[num];
        a = document.getElementById('idLinha' + num);
        a.innerHTML = '';
    }
}

/* Função chamada ao clicar no botão salvar de uma edição ou criação de uma promoção
   Responsável por salvar os dados da promoção editada ou criada */
function Salvar() {
    // Pega os campos dos Pupup Verificar
    num = document.getElementById('idVisualizado');
    nome = document.getElementById('nome');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    preco = document.getElementById('preco');
    imgCadastrada = document.getElementById('imgCadastrada');
    produtos_lista = document.getElementById('listaProdutos');
    validade = document.getElementById('validade');

    // Cria uma lista com os id's dos produtos da promoção e calcula o preço máximo da promoção
    let produtosSelecionados = [];
    let preco_maximo = 0;
    for (let opcao of produtos_lista.options) {
        if (opcao.selected) {
            produtosSelecionados.push(opcao.value);
            preco_maximo = preco_maximo + parseFloat(produtos[opcao.value].preco);
        }
    }

    // Verifica se foram selecionados produtos para a promoção
    if (!produtosSelecionados.length) {
        alert('Nenhum produto selecionado para a promoção, selecione um produto antes de salvar.');
    // Verifica se o preço escolhido é maior que o preço maximo da promoção 
    } else if (preco.value > preco_maximo){
        alert(`O preço escolhido é maior que a soma dos valores dos produtos da promoção (R$ ${parseFloat(preco_maximo)}).`);
    // Se as condições forem aceitas, cadastra os dados da promoção na lista fictícia de promoções
    } else {
        promocoes[parseInt(num.value)] = {
            id: parseInt(num.value),
            nome: nome.value,
            descricao: descricao.value ,
            foto: imgCadastrada.src,
            status: parseInt(disponibilidade.value),
            preco: parseFloat(preco.value),
            produtos_lista: produtosSelecionados,
            validade: parseFloat(validade.value),
        };

        // Aumenta o contador de quantidade de promoções se for uma criação de promoção
        if (numero_promocoes == parseInt(num.value)) {
            numero_promocoes++;
        }

        // Fecha o Pupup atual
        window.location.assign("#");

        // Atualiza as promoções cadastradas para apresentação
        AtualizarTabela();
    }
}

// Função de atualização dos dados da tabela
function AtualizarTabela() {
    let promocoes_html = ``;

    // Geração das linhas da tabela
    for (let key in Object.keys(promocoes)) {
        let i = Object.keys(promocoes)[key];

        // Html do dos produtos da promoção
        let produtos_html = '';
        promocoes[i].produtos_lista.forEach((produto) => {
            produtos_html += `<p>${produtos[produto].nome}</p>`;
        });

        // Html da linha de uma promoção
        promocoes_html += `<tr id="idLinha${i}">
            <input type="number" value='${i}' id="idProduto${i}" hidden>
            <td>${promocoes[i].nome}</td>
            <td>${promocoes[i].preco}</td>
            <td class="areaProdutos">${produtos_html}</td>
            <td class="areaStatus"><span style="background-color: ${promocoes[i].status ? "var(--verde-secundario)" : "#ffd600"};">${promocoes[i].status ? "Ativo" : "Inativo"}</span></td>
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

// Possibilita a seleção de multiplas opções sem o uso do control e 
select.addEventListener('mousedown', function (e) {
    e.preventDefault();
    const opcao = e.target;

    // Arruma a função de deselecionar
    if (opcao.tagName.toLowerCase() === 'option') {
        opcao.selected = !opcao.selected;
    }
});

// Busca e apresenta os produtos já cadastrados
function ListarProdutos() {
    for (let kay in Object.keys(produtos)) {
        const option = document.createElement("option");
        option.value = produtos[kay].id;
        option.textContent = produtos[kay].nome;
        select.appendChild(option);
    }
}

// Reseta a lista de produtos selecionados
function ResetarListaProdutos(lista_produtos) {
    for (let opcao of lista_produtos) {
        if (opcao.selected) {
            opcao.selected = false;
        }
    }
}