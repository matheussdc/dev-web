const express = require('express');
const app = express() 
const fs = require("fs");
const validateForms = require('./src/validateForms.js')


app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.set('view engine', 'ejs')

const porta = 8080
app.listen(porta, function () {
	console.log(`Server listening on port ${porta}`)
})

const users = require('./data/usuarios.json')
const projetos = require('./data/projetos.json')
const usuario = users[0]
const projetosUser = usuario.projetos.map(projetoId => {
	const projeto = projetos.find(p => p.id === projetoId);
    return { id: projeto.id, nome: projeto.nome };
});

app.get('/', (req, res) => {
	try {
		const projetos = require('./data/projetos.json')
		const total_projetos = projetos.length
		const imagens = []
		for(let i = 1; i <= 3 && i <= total_projetos; i++) {
			imagens.push({ src: projetos.at(-i).imagem, projeto: projetos.at(-i).nome })
		}

		let total_testes = 0
		const testes = fs.readdirSync('./data/testes')
		testes.forEach(arquivo => {
			total_testes += JSON.parse(fs.readFileSync(`./data/testes/${arquivo}`)).length
		})


		res.render('index', { imagens, total_testes, total_projetos })
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})
app.get('/user', (req, res) => res.render('user', { usuario, projetosUser }))

/* Rota pro fetch async do cliente para preencher as tabelas */
app.get('/testes/:id', (req, res) => {
	try{
		const testes = JSON.parse(fs.readFileSync(`data/testes/projeto${req.params.id}.json`))
		testes.push({ nivel: usuario.nivel}) //usar session token pra isso
		res.send(testes)
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})

/* Recebe o formulário preenchido, valida e cria um teste relacionado ao projeto especificado */
app.post('/add_teste', validateForms, (req, res) => {
	res.send("show mano")
})