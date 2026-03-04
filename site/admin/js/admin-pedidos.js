const API_URL = 'https://cantina-api-rlqm.onrender.com/api';

const AUTH_HEADER = {
    'Authorization': 'Basic ' + btoa('admin:123'),
    'Content-Type': 'application/json'
};

let dados_pedidos;

let tabela = document.getElementById('bodyTabela');

let status_pagamento_possiveis = ['PENDENTE', 'PAGO'];

// Coloca os pedidos já enviados para a apresentação
AtualizarTabela();

// Função de atualização dos dados da tabela
async function AtualizarTabela() {
    tabela.innerHTML += '<td colspan="8" id="linhaCarregamento"><div>A carregar ...</div></td>';

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
            <td>`;

        let valor_total = 0;

        let segundo_html = `</td>
            <td class="areaProdutos">`;
        dado.itens.forEach((produto) => {
            segundo_html += `<p><b>${produto.quantidade} x</b> ${produto.produto.nome}</p>`;
            valor_total += produto.quantidade*produto.produto.preco;
        });
        
        let terceiro_html = `</td>
            <td>${dado.observacoes}</td>`;
            

        let quarto_html = '';
        if (!dado.idTransacaoExterna) {
            quarto_html = `<td class="areaFormasPagamento">
                <select class="formasPagamento" id="listaFormasPagamento${dado.id}">
                    <option value="PIX">Pix</option>
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="FIADO">Fiado</option>
                </select>
            </td>
            <td class="areaPagamento">
                <select class="statusPagamento" id="listaStatusPagamentoPossiveis${dado.id}">
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

        let cinco_html = `<td class="areaPedido">
                <select class="statusPedido" id="listaStatusPossiveis${dado.id}">
                    <option value="AGUARDANDO">Aguardando</option>
                    <option value="PRONTO">Pronto</option>
                    <option value="RETIRADO">Retirado</option>
                    <option value="CANCELADO">Cancelado</option>
                </select>
            </td>
        </tr>`;

        pedidos_html += primeiro_html + valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + segundo_html + terceiro_html + quarto_html + cinco_html;
    
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
    aplicarFiltros();
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
            console.log(status);
        });
    });
};

// Adiciona evento que ao selecionar retirado ou cancelado pede uma confirmação e tira o item da vizualização
function CarregarEventos() {
    dados_pedidos.forEach((dado) => {
        let status_pedido = document.getElementById(`listaStatusPossiveis${dado.id}`);
        if (!status_pedido) return;

        // Salva o valor anterior ao focar no select
        status_pedido.addEventListener('focus', salvarValorAnterior);

        // Trata a mudança de status
        status_pedido.addEventListener('change', async function (event) {
            const novoStatus = this.value;
            const valorAnterior = this.getAttribute('data-valor-anterior');
            const pedidoId = dado.id;
            const numeroRetirada = dado.numeroRetirada;

            // Confirmação para retirado ou cancelado
            if (novoStatus === 'RETIRADO' || novoStatus === 'CANCELADO') {
                const confirmacao = confirm(`Tem certeza que deseja marcar o pedido #${numeroRetirada} como "${novoStatus}"? Após confirmar, o pedido será removido da lista.`);
                if (!confirmacao) {
                    this.value = valorAnterior;
                    return;
                }
            }

            try {
                const resposta = await fetch(API_URL + `/admin/pedidos/${pedidoId}/status`, {
                    method: 'PATCH',
                    headers: AUTH_HEADER,
                    body: JSON.stringify({ status: novoStatus })
                });

                if (resposta.ok) {
                    console.log(`Pedido ${pedidoId} alterado para ${novoStatus}`);
                    if (novoStatus === 'RETIRADO' || novoStatus === 'CANCELADO') {
                        const linha = document.getElementById(`idLinha${pedidoId}`);
                        if (linha) {
                            linha.style.display = 'none';
                        }
                    }
                } else {
                    const erro = await resposta.text();
                    throw new Error(erro || 'Erro ao atualizar status');
                }
            } catch (error) {
                console.error('Falha na requisição:', error);
                alert('Erro ao alterar status. Verifique sua conexão e tente novamente.');
                this.value = valorAnterior;
            }
        });
    });
}

// Função auxiliar para salvar o valor anterior no foco
function salvarValorAnterior(event) {
    const select = event.currentTarget;
    select.setAttribute('data-valor-anterior', select.value);
}

//Filtro
function aplicarFiltros() {
    const filtroForma = document.getElementById('filtroFormaPagamento').value;
    const filtroStatusPag = document.getElementById('filtroStatusPagamento').value;
    const filtroStatusPed = document.getElementById('filtroStatusPedido').value;
    const ocultarFinalizados = document.getElementById('filtroOcultarFinalizados').checked;

    const linhas = document.querySelectorAll('#bodyTabela tr');

    linhas.forEach(linha => {
        if (linha.id === 'linhaCarregamento') return;

        let formaPagamento, statusPagamento, statusPedido;

        // Forma de pagamento
        const selectForma = linha.querySelector('.formasPagamento');
        if (selectForma) {
            formaPagamento = selectForma.value;
        } else {
            const pForma = linha.querySelector('td p[id^="listaFormasPagamento"]');
            formaPagamento = pForma ? pForma.textContent.trim() : '';
        }

        // Status do pagamento
        const selectStatusPag = linha.querySelector('.statusPagamento');
        if (selectStatusPag) {
            statusPagamento = selectStatusPag.value;
        } else {
            const pStatusPag = linha.querySelector('td p[id^="listaStatusPagamento"]');
            statusPagamento = pStatusPag ? pStatusPag.textContent.trim() : '';
        }

        // Status do pedido
        const selectStatusPed = linha.querySelector('.statusPedido');
        statusPedido = selectStatusPed ? selectStatusPed.value : '';

        const atendeForma = !filtroForma || formaPagamento === filtroForma;
        const atendeStatusPag = !filtroStatusPag || statusPagamento === filtroStatusPag;
        const atendeStatusPed = !filtroStatusPed || statusPedido === filtroStatusPed;

        // Ocultar finalizados e retirados
        let atendeFinalizados = true;
        if (ocultarFinalizados) {
            atendeFinalizados = (statusPedido !== 'RETIRADO' && statusPedido !== 'CANCELADO');
        }

        linha.style.display = (atendeForma && atendeStatusPag && atendeStatusPed && atendeFinalizados) ? '' : 'none';
    });

    // Fecha o popup após aplicar
    document.getElementById('popupFiltros').style.display = 'none';
}

function limparFiltros() {
    document.getElementById('filtroFormaPagamento').value = '';
    document.getElementById('filtroStatusPagamento').value = '';
    document.getElementById('filtroStatusPedido').value = '';
    document.getElementById('filtroOcultarFinalizados').checked = false;

    const linhas = document.querySelectorAll('#bodyTabela tr');
    linhas.forEach(linha => {
        linha.style.display = '';
    });

    document.getElementById('popupFiltros').style.display = 'none';
}

// Inicialização dos eventos do popup e botões
document.addEventListener('DOMContentLoaded', () => {
    // Popup
    const btnAbrir = document.getElementById('btnAbrirFiltros');
    const popup = document.getElementById('popupFiltros');
    const btnFechar = document.querySelector('.popup-fechar');

    if (btnAbrir && popup && btnFechar) {
        btnAbrir.addEventListener('click', () => {
            popup.style.display = 'block';
        });

        btnFechar.addEventListener('click', () => {
            popup.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === popup) {
                popup.style.display = 'none';
            }
        });
    }

    // Botões do filtro
    document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimparFiltros').addEventListener('click', limparFiltros);
});

// Arrumar cores dos selects