function changeCSS(element) {
    css = document.getElementById("cssFile");
    css.href = element.getAttribute("data-cssAlt");
    troca = css.href.includes("/css/projeto.css") ? "/css/projeto-accessible.css" : "/css/projeto.css";
    element.setAttribute("data-cssAlt", troca);
    defaulttxt = "Versão Acessível";
    alttxt = "Voltar para Versão Padrão";
    txt = css.href.includes("/css/projeto.css") ? defaulttxt : alttxt;
    element.innerHTML = txt;
}

async function getUsers(projeto) {
    var projeto_id = projeto.getAttribute("value")
    var projeto_nome = projeto.innerText;
    try {
        const url = `/lista/${projeto_id}`
        const response = await fetch(url)
        if(!response.ok) throw new Error(`Status da Resposta: ${response.status}`);
        const responseJSON = await response.json()
        const lista = responseJSON.lista
        const imagem = responseJSON.imagem

        const theader = document.querySelector(".table-container h2")
        theader.innerText = `Lista de Usuários com Acesso - ${projeto_nome}`

        const img = document.querySelector("fieldset img")
        img.setAttribute("src", `/images/${imagem}`)
        img.setAttribute("alt", `Hardware associado a ${projeto_nome}`)

        const tbody = document.querySelector("tbody")
        tbody.innerHTML = ""
        lista.forEach((user) => {
            let row = `<tr>
            <td>${user.nome}</td>
            <td>${user.cargo}</td>
            <td>${user.email}</td>
            <td>${user.nivel}</td>
            <td>
                <button class="nivel">Alterar Nível</button>
                <button class="acesso">Remover do Projeto</button>
                <button class="remover">Remover Conta</button>
            </td>
            </tr>
            `
            tbody.innerHTML += row
        })
    }
    catch (error) {    
        console.error(error.message)
    }
}

function addUser(usuario) {
    const nome = usuario.innerText
    const id = usuario.getAttribute("value")
    console.log(`Função pra adicionar o ${nome} - ${id} selecionado ao projeto`)
}