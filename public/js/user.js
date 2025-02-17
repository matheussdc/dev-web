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
            <td>${teste.data}</td>
            <td>${teste.avaliacao}</td>
            <td>${resultado}</td>
            `
            if(teste.detalhes.length > 0) {
                descricoes[teste.id] = teste.detalhes
                row += "<td><button onclick='openmodal(this)'>Ver</button></td>"
            } else {
                row += "<td></td>"
            }
            console.log("oie cheuggei com", nivel)
            if([2, 3].includes(nivel)) {
                row += `<td>
                            <button>Editar</button>`
                if(nivel == 3) {
                    row +=" <button class='delete-btn'>Deletar</button>"
                }
                row += "</td>"
            }

            row += "</tr>"
            tbody.innerHTML += row
        })
    }
    catch (error) {
        console.error(error.message)
    }
}

//onload
function initial() {
    window.location.hash = "projetos";
}