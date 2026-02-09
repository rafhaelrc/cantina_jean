const API_URL = 'https://cantina-api-rlqm.onrender.com/api';

const AUTH_HEADER = {
    'Authorization': 'Basic ' + btoa('admin:123'),
    'Content-Type': 'application/json'
};

let dados_pedidos;

let tabela = document.getElementById('bodyTabela');

let status_pagamento_possiveis = ['PENDENTE', 'PAGO'];

// Coloca as promoções já cadastradas para apresentação
AtualizarTabela();

// Função de atualização dos dados da tabela
async function AtualizarTabela() {
    tabela.innerHTML = 'A carregar ...';

    const resposta = await fetch(API_URL+'/admin/pedidos', { 
        method: 'GET', 
        headers: AUTH_HEADER 
    });

    dados_pedidos = await resposta.json();

    let pedidos_html = ``;
    let contador_linhas = 0;

    dados_pedidos.forEach((dado) => {
        // Html da linha de uma categoria
        let primeiro_html = `<tr id="idLinha${dado.id}">
            <input type="number" value='${dado.id}' id="idPedido${dado.id}" hidden>
            <td>${dado.numeroRetirada}</td>
            <td>${dado.nomeAluno}</td>
            <td class="areaProdutos">`;

        let segundo_html = '';
        dado.itens.forEach((produto) => {
            segundo_html += `<p><b>${produto.quantidade} x</b> ${produto.produto.nome}</p>`;
        });
        
        let terceiro_html = `</td>
            <td>${dado.observacoes}</td>`;

        let quarto_html = '';
        if (!dado.idTransacaoExterna) {
            quarto_html = `<td>
                <select class="formasPagamento" id="listaFormasPagamento${dado.id}">
                    <option value="PIX">Pix</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="FIADO">Fiado</option>
                </select>
            </td>
            <td class="areaStatus">
                <select class="statusPagamento id="listaStatusPagamentoPossiveis${dado.id}">
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                </select>
            </span></td>`;
        } else {
            quarto_html = `<td>
                <p id="listaFormasPagamento${dado.id}">
                    ${dado.formaPagamento/*formas_pagamento[0]*/} 
                </p>
            </td>
            <td class="areaStatus">
                <p id="listaStatusPagamentoPossiveis${dado.id}">
                    ${status_pagamento_possiveis[1]}
                </p>
            </span></td>`;
        };

        let cinco_html = `<td class="areaBotoes">
                <select class="statusPedido" id="listaStatusPossiveis${dado.id}">
                    <option value="AGUARDANDO">Aguardando</option>
                    <option value="PRONTO">Pronto</option>
                    <option value="RETIRADO">Retirado</option>
                    <option value="CANCELADO">Cancelado</option>
                </select>
            </td>
        </tr>`;

        pedidos_html += primeiro_html + segundo_html + terceiro_html + quarto_html + cinco_html;
    });

    // Passagem do texto gerado das linhas da tebela para o html
    tabela.innerHTML = pedidos_html;

    // Geração das linhas da tabela
    dados_pedidos.forEach((dado) => {
        let lista_formas_pagamento = document.getElementById('listaFormasPagamento'+dado.id);
        let lista_status_pagamento_possiveis = document.getElementById('listaStatusPagamentoPossiveis'+dado.id);
        let lista_status_possiveis = document.getElementById('listaStatusPossiveis'+dado.id);

        if (!dado.idTransacaoExterna) {
            lista_formas_pagamento.value = dado.formaPagamento; // formas_pagamento[0]
            lista_status_pagamento_possiveis.value = status_pagamento_possiveis[0];///////////
            lista_status_possiveis.value = dado.status;
        };
    });
    
    CarregarEventos();
}

// Alterar status pedido
async function CarregarEventos() {
    dados_pedidos.forEach((dado) => {
        let status_pedido = document.getElementById(`listaStatusPossiveis${dado.id}`);
        status_pedido.addEventListener('change', async (event) => {
            let status = status_pedido.value;
            const resposta = await fetch(API_URL+`/admin/pedidos/${dado.id}/status`, { 
                method: 'PATCH', 
                headers: AUTH_HEADER,
                body: JSON.stringify({ status })
            });
        });
    });
};

// Adicionar evento que ao selecionar retirado ou canselado pede uma confirmação e tira o item da vizualização

// Criar filtro

// Arrumar cores dos selects