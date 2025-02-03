function changeCSS(element) {
    css = document.getElementById("cssFile");
    css.href = element.getAttribute("data-cssAlt");
    troca = css.href.includes("user.css") ? "user-accessible.css" : "user.css";
    element.setAttribute("data-cssAlt", troca);
    defaulttxt = "Versão Acessível";
    alttxt = "Voltar para Versão Padrão";
    txt = css.href.includes("user.css") ? defaulttxt : alttxt;
    element.innerHTML = txt;
}
function openmodal(btn){
    var row = btn.parentNode.parentNode;
    var valorPuro = row.cells[0].innerText
    var valor = parseInt(valorPuro)
    var modal = document.getElementById(`modal${valor}`)
    modal.style.display="table";
    span = modal.getElementsByClassName("close")[0]
    texto = modal.getElementsByTagName("h2")[0]
    texto.innerText =`Anotações sobre o teste ${valorPuro}`
    span.onclick = function() {modal.style.display = "none";}
}