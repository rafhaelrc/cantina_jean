let tabela = document.getElementById('bodyTabela');
let objetos = {
    0: {
        id: 0,
        nome: 'COCA 600 ML',
        categoria: 'Bebidas',
        descricao: 'Garrafa de Coca-Cola de 600 ml',
        foto: 'Lapis.svg',
        status: 1,
        preco: 10,
    },

    1: {
        id: 1,
        nome: 'Torrada completa',
        categoria: 'Categoria',
        descricao: 'Torrada com ovo, queijo, presunto, salada e tomate',
        foto: 'Lupa.svg',
        status: 1,
        preco: 0,
    },

    2: {
        id: 2,
        nome: 'Coxinha de frango',
        categoria: 'Categoria',
        descricao: 'Coxinha de frango frita',
        foto: 'Lapis.svg',
        status: 1,
        preco: 0,
    },

    3: {
        id: 3,
        nome: 'Brigadeiro',
        categoria: 'Categoria',
        descricao: 'Brigadeiro caseiro',
        foto: 'fotoPadraoProduto.svg',
        status: 1,
        preco: 0,
    },

    4: {
        id: 4,
        nome: 'Morango do amor',
        categoria: 'Categoria',
        descricao: 'Morango com Cobertura caramelizada',
        foto: 'fotoPadraoProduto.svg',
        status: 0,
        preco: 0,
    },
};

let objetos_html = ``;

for (var i = 0; i < Object.keys(objetos).length; i++) {
    objetos_html += `<tr>
        <input type="number" value='${i}' id="idProduto${i}" hidden>
        <td>${objetos[i].nome}</td>
        <td>${objetos[i].descricao}</td>
        <td class="areaStatus"><span style="background-color: ${objetos[i].status ? "var(--verde-secundario)" : "#ffd600"};">${objetos[i].status ? "Ativo" : "Inativo"}</span></td>
        <td class="areaBotoes">
            <a href="#popupVisualizar"><button class="botaoVisualizar" onclick="Visualizar(${i})"><img src="Lupa.svg" alt="Visualizar" width="25px" height="25px"></button></a>
            <a href="#popupVerificar"><button class="botaoEditar" onclick="Editar(${i})"><img src="Lapis.svg" alt="Editar" width="25px" height="25px"></button></a>
            <button class="botaoExcluir" onclick="Excluir(${i})"><img src="Lixeira.svg" alt="Excluir" width="25px" height="25px"></button>
        </td>
    </tr>`
};

tabela.innerHTML = objetos_html;

function Cadastrar(){
    nome = document.getElementById('nome');
    categoria = document.getElementById('categoria');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    enviarFoto = document.getElementById('enviarFoto');
    preco = document.getElementById('preco');
    imgCadastrada = document.getElementById('imgCadastrada');

    nome.value = '';
    categoria.value = '';
    descricao.value = '';
    disponibilidade.value = 1;
    preco.value = 0;
    imgCadastrada.src = 'fotoPadraoProduto.svg';
}

function Visualizar(num){
    disponibilidade = document.getElementById('disponibilidade');
    console.log(disponibilidade.value);
}

function Editar(num){
    nome = document.getElementById('nome');
    categoria = document.getElementById('categoria');
    descricao = document.getElementById('descricao');
    disponibilidade = document.getElementById('disponibilidade'); // => 0 ou 1: Representa status
    enviarFoto = document.getElementById('enviarFoto');
    preco = document.getElementById('preco');
    imgCadastrada = document.getElementById('imgCadastrada');

    nome.value = objetos[num].nome;
    categoria.value = objetos[num].categoria;
    descricao.value = objetos[num].descricao;
    disponibilidade.value = objetos[num].status;
    preco.value = objetos[num].preco;
    imgCadastrada.src = objetos[num].foto;
}

function Excluir(num){
    console.log(objetos[num].nome);
}

function Salvar() {
    
}