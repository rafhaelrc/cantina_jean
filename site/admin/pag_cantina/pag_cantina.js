let tabela = document.getElementById('bodyTabela');
let objetos = [
    {
        nome: 'COCA 600 ML',
        categoria: 'Bebidas',
        descricao: 'Garrafa de Coca-Cola de 600 ml',
        foto: 'URL',
        status: 'Ativo',
        preco: 10,
    },

    {
        nome: 'Torrada completa',
        categoria: 'Categoria',
        descricao: 'Torrada com ovo, queijo, presunto, salada e tomate',
        foto: 'URL',
        status: 'Ativo',
        preco: 0,
    },

    {
        nome: 'Coxinha de frango',
        categoria: 'Categoria',
        descricao: 'Coxinha de frango frita',
        foto: 'URL',
        status: 'Ativo',
        preco: 0,
    },

    {
        nome: 'Brigadeiro',
        categoria: 'Categoria',
        descricao: 'Brigadeiro caseiro',
        foto: 'URL',
        status: 'Ativo',
        preco: 0,
    },

    {
        nome: 'Morango do amor',
        categoria: 'Categoria',
        descricao: 'Morango com Cobertura caramelizada',
        foto: 'URL',
        status: 'Inativo',
        preco: 0,
    },
];

let objetos_html = ``;

for (var i = 0; i < objetos.length; i++) {
    objetos_html += `<tr>
        <td class="table-active">${objetos[i].nome}</td>
        <td>${objetos[i].descricao}</td>
        <td class="table-active">${objetos[i].status}</td>
        <td class="areaBotoes">
            <button class="botaoVisualizar" onclick="Verificar(${i})"><img src="Lupa.svg" alt="Visualizar" width="25px" height="25px"></button>
            <button class="botaoEditar" onclick="Editar(${i})"><img src="Lapis.svg" alt="Editar" width="25px" height="25px"></button>
            <button class="botaoExcluir" onclick="Excluir(${i})"><img src="Lixeira.svg" alt="Excluir" width="25px" height="25px"></button>
        </td>
    </tr>`
};

tabela.innerHTML = objetos_html;

function Verificar(num){
    objetos[num].nome
}