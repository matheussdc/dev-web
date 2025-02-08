function changeCSS(element) {
    css = document.getElementById("cssFile");
    css.href = element.getAttribute("data-cssAlt");
    troca = css.href.includes("/css/index.css") ? "/css/index-accessible.css" : "/css/index.css";
    element.setAttribute("data-cssAlt", troca);
    defaulttxt = "Versão Acessível";
    alttxt = "Voltar para Versão Padrão";
    txt = css.href.includes("/css/index.css") ? defaulttxt : alttxt;
    element.innerHTML = txt;
}