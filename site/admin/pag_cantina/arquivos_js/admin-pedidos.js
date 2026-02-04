let tabela = document.getElementById('bodyTabela');
let numero_produtos = 5;

let formas_pagamento = ['Pix', 'Balcão', 'Fiado'];

let status_pagamento_possiveis = ['Pendente', 'Pago'];

let status_possiveis = ['Aguardando', 'Pronto', 'Retirado', 'Cancelado'];

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

// Lista fictícia de objetos representando os pedidos
let pedidos = [
    /* Detalhamento do objeto em pedidos
    {
        id: id_altomatico,
        nome: 'Nome de quem pediu',
        lista_produtos: [
            {
                produto: id_do_produto_do_pedido,
                quantidade: quantidade_do_produto_do_pedido,
            },

            {
                produto: id_do_produto_do_pedido,
                quantidade: quantidade_do_produto_do_pedido,
            },
        ],
        descricao: 'Texto escrito por quem pediu',
        pagamento: id_referente_à_forma_de_pagamento, // ['Pix', 'Balcão', 'Fiado']
        status_pagamento: id_referente_ao_status_pagamento, // ['Pendente', 'Pago']
        status: id_referente_ao_status_do_pedido, // ['Aguardando', 'Pronto', 'Retirado', 'Cancelado']
        editavel: 1, // Represent se foi pago pelo app ou será pago depois
    },
    */

    {
        id: 0,
        nome: 'Daniel',
        lista_produtos: [
            {
                produto: 0,
                quantidade: 1,
            },

            {
                produto: 1,
                quantidade: 1,
            },
        ],
        descricao: 'Torrada sem queijo',
        pagamento: 1,
        status_pagamento: 0,
        status: 0,
        editavel: 1, // Represent se foi pago pelo app ou será pago depois
    },

    {
        id: 1,
        nome: 'Pedro',
        lista_produtos: [
            {
                produto: 4,
                quantidade: 1,
            },
        ],
        descricao: 'Torrada sem queijo',
        pagamento: 0,
        status_pagamento: 1,
        status: 0,
        editavel: 0, // Represent se foi pago pelo app ou será pago depois
    },

    {
        id: 2,
        nome: 'Henrique',
        lista_produtos: [
            {
                produto: 2,
                quantidade: 2,
            },
        ],
        descricao: 'Torrada sem queijo',
        pagamento: 1,
        status_pagamento: 0,
        status: 0,
        editavel: 1, // Represent se foi pago pelo app ou será pago depois
    },
];

// Coloca as promoções já cadastradas para apresentação
AtualizarTabela();

// Função de atualização dos dados da tabela
function AtualizarTabela() {
    let pedidos_html = ``;

    // Geração das linhas da tabela
    for (let i in Object.keys(pedidos)) {
        // let i = Object.keys(pedidos)[key];

        // Html da linha de um produto
        let primeiro_html = `<tr id="idLinha${i}">
            <input type="number" value='${i}' id="idProduto${i}" hidden>
            <td>${pedidos[i].id}</td>
            <td>${pedidos[i].nome}</td>
            <td class="areaProdutos">`;

        let segundo_html = ''
        for (let produto in Object.keys(pedidos[i].lista_produtos)) {
            segundo_html += `<p><b>${pedidos[i].lista_produtos[parseInt(produto)].quantidade} x</b> ${produtos[pedidos[i].lista_produtos[parseInt(produto)].produto].nome}</p>`;
        }
        
        let terceiro_html = `</td>
            <td>${pedidos[i].descricao}</td>`;

        let quarto_html = ''
        if (pedidos[i].editavel) {
            quarto_html = `<td>
                <select id="listaFormasPagamento${i}">
                    <option value="0">Pix</option>
                    <option value="1">Balcão</option>
                    <option value="2">Fiado</option>
                </select>
            </td>
            <td class="areaStatus">
                <select id="listaStatusPagamentoPossiveis${i}">
                    <option value="0">Pendente</option>
                    <option value="1">Pago</option>
                </select>
            </span></td>`;
        } else {
            quarto_html = `<td>
                <p id="listaFormasPagamento${i}">
                    ${formas_pagamento[pedidos[i].pagamento]}
                </p>
            </td>
            <td class="areaStatus">
                <p id="listaStatusPagamentoPossiveis${i}">
                    ${status_pagamento_possiveis[pedidos[i].status_pagamento]}
                </p>
            </span></td>`;
        };

        let cinco_html = `<td class="areaBotoes">
                <select id="listaStatusPossiveis${i}">
                    <option value="0">Aguardando</option>
                    <option value="1">Pronto</option>
                    <option value="2">Retirado</option>
                    <option value="3">Cancelado</option>
                </select>
            </td>
        </tr>`

        pedidos_html += primeiro_html + segundo_html + terceiro_html + quarto_html + cinco_html;
    };

    // Passagem do texto gerado das linhas da tebela para o html
    tabela.innerHTML = pedidos_html;

    // Geração das linhas da tabela
    for (let key in Object.keys(pedidos)) {
        let i = Object.keys(pedidos)[key];
        let lista_formas_pagamento = document.getElementById('listaFormasPagamento'+i);
        let lista_status_pagamento_possiveis = document.getElementById('listaStatusPagamentoPossiveis'+i);
        let status_possiveis = document.getElementById('listaStatusPossiveis'+i);

        if (pedidos[i].editavel) {
            lista_formas_pagamento.value = pedidos[i].pagamento;
            lista_status_pagamento_possiveis.value = pedidos[i].status_pagamento;
            status_possiveis.value = pedidos[i].status;
        };
    };
}

// Busca e apresenta as categorias já cadastradas
function ListarItens(select, lista) {
    for (let kay in Object.keys(lista)) {
        const option = document.createElement("option");
        option.value = kay;
        option.textContent = lista[kay];
        select.appendChild(option);
    }
}

// Adicionar evento que ao selecionar retirado ou canselado pede uma confirmação e tira o item da vizualização

// Criar filtro

// Arrumar cores dos selects

// Adicionar função para salvar os dados de tempo em tempo para o envio no banco de dados