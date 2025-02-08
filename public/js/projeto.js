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