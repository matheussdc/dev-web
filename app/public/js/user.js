const descricoes = {}

function openmodal(btn){
    var row = btn.parentNode.parentNode;
    var valor = row.cells[0].innerText
    var modal = document.getElementById("modal_id")
    modal.style.display="table";
    span = modal.getElementsByClassName("close")[0]
    header = modal.getElementsByTagName("h2")[0]
    body = modal.getElementsByClassName("modal-body")[0]

    header.innerText =`Anotações sobre o teste ${valor}`
    body.innerHTML = `<p>${descricoes[valor]}<p>`
    span.onclick = function() {modal.style.display = "none";}
}

async function getTestes(projeto) {
    var projeto_id = projeto.getAttribute("value");
    var projeto_nome = projeto.innerText;
    try {
        const url = `/testes/${projeto_id}`
        const response = await fetch(url)
        if(!response.ok) throw new Error(`Status da Resposta: ${response.status}`);
        
        const testes = await response.json()
        let total = testes.length
        const nivel = parseInt(document.querySelector("body").getAttribute("data-nivel"))

        tot_aprovados = testes.reduce((tot, current) => {
            tot += current.resultado;
            return tot
        }, 0)
        tot_reprovados = total - tot_aprovados

        const fieldset = document.getElementById("informacoes")
        let informacoes = fieldset.querySelector("div")
        informacoes.innerHTML = `
                    <p>Total de Registros: ${total}</p>
                    <p>Testes Aprovados: ${tot_aprovados}</p>
                    <p>Testes Reprovados: ${tot_reprovados}</p>`

        const theader = document.querySelector(".table-header h2")
        theader.innerText = `Registros de Testes - ${projeto_nome}`
        const tbody = document.querySelector("tbody")
        tbody.innerHTML = ""

        testes.forEach((teste) => {
            const resultado = teste.resultado ? "Aprovado" : "Reprovado"
            let row = `<tr>
            <td>${teste.id}</td>
            <td>${teste.hardware}</td>
            <td>${teste.modelo}</td>
            <td>${teste.temperatura}</td>
            <td>${teste.pressao}</td>
            <td>${teste.altura}</td>
            `
            data = teste.data.split('-').reverse().join('-')
            row +=`
            <td>${data}</td>
            <td>${teste.avaliacao}</td>
            <td>${resultado}</td>
            `
            if(teste.detalhes.length > 0) {
                descricoes[teste.id] = teste.detalhes
                row += "<td><button onclick='openmodal(this)'>Ver</button></td>"
            } else {
                row += "<td></td>"
            }
            if([2, 3].includes(nivel)) {
                row += `<td>
                            <button onclick='editar(this)'>Editar</button>`
                if(nivel == 3) {
                    row +=" <button class='delete-btn' onclick='delTeste(this)'>Deletar</button>"
                }
                row += "</td>"
            }

            row += "</tr>"
            tbody.innerHTML += row
        })

        const inputHidden = document.querySelector("#projeto_id-add")
        inputHidden.setAttribute('value', projeto_id)
    }
    catch (error) {
        console.error(error.message)
    }
}

async function delTeste(teste) {
    var row = teste.parentNode.parentNode;
    var teste_id = row.cells[0].innerText
    var projeto_id = document.querySelector("select").value
    console.log(teste_id, typeof teste_id)
    console.log('e o do projeto é -', projeto_id)
    try {
        const url = `/delTeste/${projeto_id}/${parseInt(teste_id)}`
        const response = await fetch(url, { method: 'POST' })
        if(!response.ok) throw new Error(`Status da Resposta: ${response.status}`);

        const confirma = await response.json()
        console.log('confirma:', confirma.message)
    } catch (error) {
        console.error(error.message)
    }
}

function editar(teste) {
    show('editar')
    var form = document.querySelector("#editar form")
    var titulo = document.querySelector("#editar h2")
    var row = teste.parentNode.parentNode;
    titulo.innerText = `Editar Registro - ${row.cells[0].innerText}`
    var inputs = form.querySelectorAll("input")
    for(let i=0; i <= 7; i++){
        if(i == 6) {inputs[i].value = row.cells[i].innerText.split('-').reverse().join('-')}
        else {inputs[i].value = row.cells[i].innerText}
    }
    inputs[8].value = document.querySelector("select").value
    //descrição
    const texto = descricoes[row.cells[0].innerText]
    form.querySelector("textarea").value = texto ? texto : ""
}

function show(bloco) {
    var projetos = document.querySelector("#projetos")
    var registro = document.querySelector("#registro")
    var editar   = document.querySelector("#editar")
    if(bloco == 'projetos') {
        projetos.style.display = "block"
        registro.style.display = "none"
        editar  .style.display = "none"
    }
    if(bloco == 'registro'){
        projetos.style.display = "none"
        registro.style.display = "block"
        editar  .style.display = "none"
    } 
    if(bloco == 'editar'){
        projetos.style.display = "none"
        registro.style.display = "none"
        editar  .style.display = "block"
    }
}
//onload
function initial() {
    var projetos = document.querySelector("#projetos")
    projetos.style.display = "block"
    var registro = document.querySelector("#registro")
}