const API_URL = 'https://cantina-api-rlqm.onrender.com/api/admin';

// CORREÇÃO 1: Pegar o token real do Login (SessionStorage) em vez de hardcoded
const token = sessionStorage.getItem('tokenAdmin');
const AUTH_HEADER = {
    'Authorization': token, // Usa o token salvo no login
    'Content-Type': 'application/json'
};

let dados_produtos;
let dados_categorias;

let tabela = document.getElementById('bodyTabela');
const select = document.getElementById('categoria');

// Verifica se tem token, senão chuta pro login (Segurança extra)
if (!token) {
    window.location.href = "index.html";
}

// Inicialização
AtualizarTabela();
ListarCategorias();

// Evento de preview da imagem (Change)
document.getElementById('enviarFoto').addEventListener('change', function (event) {
    const arquivo = event.target.files[0];
    const apresentador = document.getElementById('imgCadastrada');

    if (arquivo) {
        if (!arquivo.type.startsWith('image/')) {
            alert('Selecione um arquivo de imagem válido.');
            event.target.value = '';
            return;
        } else {
            const reader = new FileReader();
            reader.onload = function(e) {
                apresentador.src = e.target.result; // Mostra preview base64
            }
            reader.readAsDataURL(arquivo);
        }
    }
});

function Cadastrar() {
    // Pega os campos
    let id = document.getElementById('idVisualizado');
    let nome = document.getElementById('nome');
    let descricao = document.getElementById('descricao');
    let disponibilidade = document.getElementById('disponibilidade');
    let preco = document.getElementById('preco');
    let imgCadastrada = document.getElementById('imgCadastrada');
    let categoria = document.getElementById('categoria');
    let titulo = document.getElementById('tituloVerificar');

    // Reseta valores
    id.value = '';
    nome.value = '';
    descricao.value = '';
    disponibilidade.value = 1;
    preco.value = 0;
    imgCadastrada.src = 'img/foto-padrao-produto.svg'; // Imagem padrão
    categoria.value = -1;
    titulo.innerText = 'Cadastrar novo produto';

    window.location.assign("#popupVerificar");
}

function Visualizar(num) {
    // Lógica de visualização (mantida igual, só adicionando img/ se precisar)
    let dado = dados_produtos[num];
    
    document.getElementById('labelNome').innerText = dado.nome;
    document.getElementById('labelDescricao').innerText = dado.descricao;
    document.getElementById('labelDisponibilidade').innerText = dado.ativo ? "Ativo" : "Inativo";
    document.getElementById('labelPreco').innerText = dado.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('labelCategoria').innerHTML = dado.categoria.nome;
    document.getElementById('tituloVisualizar').innerText = `Visualização: ${dado.nome}`;

    // Ajuste da imagem na visualização
    let caminhoImagem = dado.imagemUrl;
    if (!caminhoImagem.startsWith('http') && !caminhoImagem.startsWith('img/')) {
        caminhoImagem = 'img/' + caminhoImagem;
    }
    document.getElementById('visualizarImgCadastrada').src = caminhoImagem;

    window.location.assign("#popupVisualizar");
}

// ==========================================================
// CORREÇÃO 2: Função EDITAR ajustada para mostrar a foto certa
// ==========================================================
function Editar(num) {
    let id = document.getElementById('idVisualizado');
    let nome = document.getElementById('nome');
    let descricao = document.getElementById('descricao');
    let disponibilidade = document.getElementById('disponibilidade');
    let preco = document.getElementById('preco');
    let imgCadastrada = document.getElementById('imgCadastrada');
    let categoria = document.getElementById('categoria');
    let titulo = document.getElementById('tituloVerificar');

    let dado = dados_produtos[num];
    let dadoCat = dado.categoria;

    id.value = dado.id;
    nome.value = dado.nome;
    descricao.value = dado.descricao;
    disponibilidade.value = dado.ativo ? 1 : 0;
    preco.value = parseFloat(dado.preco);
    
    // Configura o Select da Categoria
    categoria.value = JSON.stringify({ 
        ativo: dadoCat.ativo, 
        id: dadoCat.id, 
        nome: dadoCat.nome 
    }); 
    
    // AQUI ESTÁ O AJUSTE DA IMAGEM:
    // Se no banco estiver só "coxinha.png", adicionamos "img/" para o preview não quebrar
    let caminhoImagem = dado.imagemUrl;
    if (caminhoImagem && !caminhoImagem.startsWith('http') && !caminhoImagem.startsWith('img/')) {
        caminhoImagem = 'img/' + caminhoImagem;
    }
    imgCadastrada.src = caminhoImagem;

    titulo.innerText = `Edição do produto ${dado.nome}`;

    window.location.assign("#popupVerificar");
}

async function Excluir(num) {
    if (confirm("Tem certeza que deseja excluir esse produto?")) {
        try {
            await fetch(`${API_URL}/produtos/${dados_produtos[num].id}`, {
                method: 'DELETE',
                headers: AUTH_HEADER
            });
            AtualizarTabela();
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir.');
        }
    }
}

// ==========================================================
// CORREÇÃO 3: Função SALVAR salvando apenas o NOME do arquivo
// ==========================================================
async function Salvar() {
    let id = document.getElementById('idVisualizado').value;
    let nome = document.getElementById('nome').value;
    let descricao = document.getElementById('descricao').value;
    let ativo = parseInt(document.getElementById('disponibilidade').value) ? true : false;
    let enviarFoto = document.getElementById('enviarFoto');
    let preco = parseFloat(document.getElementById('preco').value);
    
    // Tratamento de erro caso o JSON da categoria quebre
    let categoria;
    try {
        categoria = JSON.parse(document.getElementById('categoria').value);
    } catch (e) {
        categoria = -1;
    }

    let imgElement = document.getElementById('imgCadastrada');

    // LÓGICA DO NOME DA IMAGEM
    let imagemUrl = "";

    // 1. Se tem arquivo novo no input
    if (enviarFoto.files && enviarFoto.files[0]) {
        imagemUrl = enviarFoto.files[0].name; 
    } 
    // 2. Se mantém a foto antiga (pega do src e limpa o caminho)
    else if (imgElement.src) {
        const urlCompleta = imgElement.src;
        // Pega tudo depois da última barra /
        imagemUrl = urlCompleta.substring(urlCompleta.lastIndexOf('/') + 1);
    }
    
    imagemUrl = decodeURIComponent(imagemUrl);


    // Validações
    if (!categoria || categoria === -1) {
        alert('Selecione uma categoria.');
    } else if (isNaN(preco) || preco <= 0) {
        alert('Digite um preço válido.');
    } else {
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/produtos/${id}` : API_URL + '/produtos';

        try {
            let resposta = await fetch(url, {
                method: metodo,
                headers: AUTH_HEADER,
                body: JSON.stringify({ nome, descricao, ativo, preco, categoria, imagemUrl })
            });

            if (resposta.ok) {
                alert("Salvo com sucesso!");
                AtualizarTabela();
                window.location.assign("#"); // Fecha popup
            } else {
                alert("Erro ao salvar! Verifique se todos os campos estão preenchidos.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        }
    }
}

async function AtualizarTabela() {
    tabela.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';

    try {
        const resposta = await fetch(API_URL+'/produtos', { 
            method: 'GET', 
            headers: AUTH_HEADER 
        });

        if (!resposta.ok) {
            if(resposta.status === 401 || resposta.status === 403) {
                alert("Sessão expirada. Faça login novamente.");
                window.location.href = "index.html";
                return;
            }
        }

        dados_produtos = await resposta.json();
        let produtos_html = ``;
        let contador = 0;

        dados_produtos.forEach((dado) => {
            produtos_html += `
            <tr>
                <td>${dado.nome}</td>
                <td>${dado.descricao}</td>
                <td class="areaStatus">
                    <span style="background-color: ${dado.ativo ? "var(--verde-secundario)" : "#ffd600"}; padding: 5px; border-radius: 5px;">
                        ${dado.ativo ? "Ativo" : "Inativo"}
                    </span>
                </td>
                <td class="areaBotoes">
                    <button class="botaoVisualizar" onclick="Visualizar(${contador})"><img src="img/icone-lupa.svg" width="20"></button>
                    <button class="botaoEditar" onclick="Editar(${contador})"><img src="img/icone-lapis.svg" width="20"></button>
                    <button class="botaoExcluir" onclick="Excluir(${contador})"><img src="img/icone-lixeira.svg" width="20"></button>
                </td>
            </tr>`;
            contador++;
        });

        tabela.innerHTML = produtos_html;

    } catch (e) {
        console.error(e);
        tabela.innerHTML = '<tr><td colspan="4">Erro ao carregar produtos.</td></tr>';
    }
}

async function ListarCategorias() {
    try {
        const resposta = await fetch(API_URL+'/categorias', { 
            method: 'GET', 
            headers: AUTH_HEADER 
        });
        dados_categorias = await resposta.json();

        // Limpa o select antes de encher (mantendo a opção padrão)
        select.innerHTML = '<option value="-1">Selecione</option>';

        dados_categorias.forEach((dado) => {
            const option = document.createElement("option");
            // Salvamos o objeto inteiro no value para facilitar o envio depois
            option.value = JSON.stringify({ ativo: dado.ativo, id: dado.id, nome: dado.nome });
            option.textContent = dado.nome;
            select.appendChild(option);
        });
    } catch (e) {
        console.error("Erro ao listar categorias", e);
    }
}