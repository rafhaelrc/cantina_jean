   // Função que simula o login e suas validações (aguardando backend)
    function logar() {

        var usuario = document.getElementById('usuario').value;
        var senha = document.getElementById('senha').value;

        if (senha == "admin" && usuario == "admin") {
            alert('Sucesso');
        } else {
            alert('Usuário ou senha incorretos');
        }



    }
