const API_URL = 'https://cantina-api-rlqm.onrender.com/api/admin';

// === CONFIGURAÇÃO DO CLOUDINARY ===
const CLOUDINARY_CLOUD_NAME = "doidn31vi"; // Ex: "demo"
const CLOUDINARY_PRESET = "cantina_preset";         // Ex: "cantina_preset"
// ==================================

const token = sessionStorage.getItem('tokenAdmin');
const AUTH_HEADER = {
    'Authorization': token,
    'Content-Type': 'application/json'
};

let dados_produtos;
let dados_categorias;

let tabela = document.getElementById('bodyTabela');
const select = document.getElementById('categoria');

if (!token) {
    window.location.href = "index.html";
}

AtualizarTabela();
ListarCategorias();

// Preview da Imagem
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
                apresentador.src = e.target.result; 
            }
            reader.readAsDataURL(arquivo);
        }
    }
});

function Cadastrar() {
    let id = document.getElementById('idVisualizado');
    let nome = document.getElementById('nome');
    let descricao = document.getElementById('descricao');
    let disponibilidade = document.getElementById('disponibilidade');
    let preco = document.getElementById('preco');
    let imgCadastrada = document.getElementById('imgCadastrada');
    let categoria = document.getElementById('categoria');
    let titulo = document.getElementById('tituloVerificar');

    id.value = '';
    nome.value = '';
    descricao.value = '';
    disponibilidade.value = 1;
    preco.value = 0;
    imgCadastrada.src = 'img/foto-padrao-produto.svg';
    categoria.value = -1;
    titulo.innerText = 'Cadastrar novo produto';

    window.location.assign("#popupVerificar");
}

function Visualizar(num) {
    let dado = dados_produtos[num];
    document.getElementById('labelNome').innerText = dado.nome;
    document.getElementById('labelDescricao').innerText = dado.descricao;
    document.getElementById('labelDisponibilidade').innerText = dado.ativo ? "Ativo" : "Inativo";
    document.getElementById('labelPreco').innerText = dado.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('labelCategoria').innerHTML = dado.categoria ? dado.categoria.nome : "Sem Categoria";
    document.getElementById('tituloVisualizar').innerText = `Visualização: ${dado.nome}`;

    // Cloudinary retorna URL completa (http...), então funciona direto.
    // Se for imagem antiga (local), adicionamos img/
    let caminhoImagem = dado.imagemUrl;
    if (caminhoImagem && !caminhoImagem.startsWith('http')) {
        caminhoImagem = 'img/' + caminhoImagem;
    }
    document.getElementById('visualizarImgCadastrada').src = caminhoImagem || 'img/foto-padrao-produto.svg';

    window.location.assign("#popupVisualizar");
}

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
    
    if (dadoCat) {
        categoria.value = JSON.stringify({ ativo: dadoCat.ativo, id: dadoCat.id, nome: dadoCat.nome });
    } else {
        categoria.value = -1;
    }
    
    let caminhoImagem = dado.imagemUrl;
    if (caminhoImagem && !caminhoImagem.startsWith('http')) {
        caminhoImagem = 'img/' + caminhoImagem;
    }
    imgCadastrada.src = caminhoImagem || 'img/foto-padrao-produto.svg';

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

// === FUNÇÃO NOVA: UPLOAD PARA O CLOUDINARY ===
async function uploadImagemCloudinary(arquivo) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const formData = new FormData();
    formData.append("file", arquivo);
    formData.append("upload_preset", CLOUDINARY_PRESET);

    try {
        let resposta = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (resposta.ok) {
            let dados = await resposta.json();
            return dados.secure_url; // Retorna o link https://...
        } else {
            console.error("Erro Cloudinary", await resposta.text());
            throw new Error("Falha no upload da imagem");
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function Salvar() {
    let id = document.getElementById('idVisualizado').value;
    let nome = document.getElementById('nome').value;
    let descricao = document.getElementById('descricao').value;
    let ativo = parseInt(document.getElementById('disponibilidade').value) ? true : false;
    let enviarFoto = document.getElementById('enviarFoto');
    let preco = parseFloat(document.getElementById('preco').value);
    
    let categoriaObj;
    try {
        categoriaObj = JSON.parse(document.getElementById('categoria').value);
    } catch (e) {
        categoriaObj = null;
    }

    if (!nome || nome.trim() === "") { alert("Nome é obrigatório!"); return; }
    if (!categoriaObj || !categoriaObj.id) { alert('Selecione uma categoria válida.'); return; } 
    if (isNaN(preco) || preco <= 0) { alert('Digite um preço válido.'); return; }

    // === LÓGICA DE UPLOAD ===
    let imagemUrlFinal = "";
    
    // Mostra aviso de carregando no botão (UX)
    let botaoSalvar = document.querySelector("#popupVerificar button");
    let textoOriginal = botaoSalvar.innerText;
    botaoSalvar.innerText = "Enviando imagem...";
    botaoSalvar.disabled = true;

    try {
        // Cenário 1: Usuário escolheu um arquivo NOVO
        if (enviarFoto.files && enviarFoto.files[0]) {
            console.log("Iniciando upload para Cloudinary...");
            // Espera o upload terminar e pega o link
            imagemUrlFinal = await uploadImagemCloudinary(enviarFoto.files[0]);
            console.log("Upload concluído:", imagemUrlFinal);
        } 
        // Cenário 2: Mantém a imagem antiga
        else {
            let imgElement = document.getElementById('imgCadastrada');
            // Se já for link de internet, usa ele. Se for local, tenta limpar.
            imagemUrlFinal = imgElement.src;
            
            // Se for local (file:/// ou localhost...), limpamos para salvar só o nome se necessário
            // Mas idealmente agora salvaremos Links Completos.
            if (imagemUrlFinal.startsWith("data:")) {
                 // É um base64 de preview que não foi enviado... erro
                 alert("Por favor, selecione a imagem novamente.");
                 return;
            }
        }

        // Prepara dados para o Backend Java
        const dadosParaEnviar = {
            nome: nome,
            descricao: descricao,
            ativo: ativo,
            preco: preco,
            imagemUrl: imagemUrlFinal, // Agora vai o link https://res.cloudinary...
            categoria: {
                id: categoriaObj.id
            }
        };

        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/produtos/${id}` : API_URL + '/produtos';

        let resposta = await fetch(url, {
            method: metodo,
            headers: AUTH_HEADER,
            body: JSON.stringify(dadosParaEnviar)
        });

        if (resposta.ok) {
            alert("Salvo com sucesso!");
            window.location.assign("#"); 
            AtualizarTabela();
        } else {
            const erroTexto = await resposta.text();
            alert("Erro do servidor: " + erroTexto);
        }

    } catch (error) {
        console.error(error);
        alert("Erro ao processar: " + error.message);
    } finally {
        // Restaura o botão
        botaoSalvar.innerText = textoOriginal;
        botaoSalvar.disabled = false;
    }
}

async function AtualizarTabela() {
    tabela.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
    try {
        const resposta = await fetch(API_URL+'/produtos', { 
            method: 'GET', headers: AUTH_HEADER 
        });
        if (!resposta.ok) { 
             /* Tratamento de erro 401/403 aqui se quiser */ 
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
        tabela.innerHTML = '<tr><td colspan="4">Erro ao carregar.</td></tr>';
    }
}

async function ListarCategorias() {
    try {
        const resposta = await fetch(API_URL+'/categorias', { method: 'GET', headers: AUTH_HEADER });
        dados_categorias = await resposta.json();
        select.innerHTML = '<option value="-1">Selecione</option>';
        dados_categorias.forEach((dado) => {
            const option = document.createElement("option");
            option.value = JSON.stringify({ ativo: dado.ativo, id: dado.id, nome: dado.nome });
            option.textContent = dado.nome;
            select.appendChild(option);
        });
    } catch (e) {
        console.error("Erro ao listar categorias", e);
    }
}