function changeCSS() {
    console.log(temaAtual)
    if(temaAtual.href.includes("accessible")) {
        makeDefault()
        localStorage.setItem("cssStyle", "default")
    }
    else {
        makeAccessible()
        localStorage.setItem("cssStyle", "accessible")
    }
}

function makeDefault() {
    const fileCSS = temaAtual.href.split("/css/").at(-1)
    const file = fileCSS.split("-accessible")
    const fileDEFAULT = "/css/" + file[0] + (fileCSS.includes("accessible") ? file[1] : "")
    temaAtual.href = fileDEFAULT
    console.log("fileCSS", fileCSS, "|| file", file, "|| fileDEF", fileDEFAULT)
}
function makeAccessible() {
    const fileCSS = temaAtual.href.split("/css/").at(-1)
    const file = fileCSS.split(".").at(0)
    const fileACCESSIBLE = "/css/" + file + "-accessible.css"
    temaAtual.href = fileACCESSIBLE
    console.log("fileCSS", fileCSS, "|| file", file, "|| fileACCES", fileACCESSIBLE)
}

function ajusteFonte(tamanho) {
    let currentSize = parseFloat(window.getComputedStyle(document.body).fontSize);
    
    let newSize = currentSize + tamanho
    if (newSize < 12) newSize = 12
    if (newSize > 26) newSize = 26

    document.body.style.fontSize = `${newSize}px`
    document.querySelectorAll("button").forEach(btn => btn.style.fontSize = `${newSize}px`)
    document.querySelectorAll("select").forEach(slct => slct.style.fontSize = `${newSize}px`)
    
    localStorage.setItem('fontSize', newSize)
}

//onload
document.querySelector("#contrast").addEventListener("click", changeCSS)
const temaAtual = document.querySelector("#cssFile")

const salvoCSS = localStorage.getItem("cssStyle")
if(salvoCSS.includes("accessible")) {makeAccessible()}
else {makeDefault()}
    

const salvoFonte = localStorage.getItem("fontSize")
if(salvoFonte) {
    document.body.style.fontSize = `${salvoFonte}px`
    document.querySelectorAll("button").forEach(btn => btn.style.fontSize = `${salvoFonte}px`)
    document.querySelectorAll("select").forEach(slct => slct.style.fontSize = `${salvoFonte}px`)
}

const aumentaFonteButton = document.getElementById("aumentaFonte");
const diminuiFonteButton = document.getElementById("diminuiFonte");
aumentaFonteButton.addEventListener("click", () => ajusteFonte(2));
diminuiFonteButton.addEventListener("click", () => ajusteFonte(-2));