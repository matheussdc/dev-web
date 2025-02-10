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

/* Rota root index */
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


app.post('/login', (req, res) => {
	console.log(req.body)
	const users = require('./data/usuarios.json')
	const login = users.find(user => user.email == req.body.email && user.senha == req.body.password)
	if(login) {
		res.redirect(`/user/${login.id}`)
	}
	else {
		res.status(404).redirect('/')
	}
})

app.get('/user/:userid', (req, res) => {
	try {
		const users = require('./data/usuarios.json')
		const usuario = users.find(user => user.id == req.params.userid)
		const projetos = require('./data/projetos.json')
		const projetosUser = usuario.projetos.map(projetoId => {
			const projeto = projetos.find(p => p.id === projetoId);
			return { id: projeto.id, nome: projeto.nome };
		});
		res.render('user', { usuario, projetosUser })
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})

app.get('/projeto/:userid', (req, res) => {
	try {
		const users = require('./data/usuarios.json')
		const usuario = users.find(user => user.id == req.params.userid)
		const lista = users.map(user => {return { id:user.id, nome: user.nome }})
		const projetosJSON = require('./data/projetos.json')
		const projetos = projetosJSON.map(projeto => {return { id: projeto.id, nome: projeto.nome }})
		if(usuario.nivel == 3) {
			res.render('projeto', { usuario, projetos, lista })
		}
		else {
			res.redirect(req.header.referer)
		}
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})

/* Rota pro fetch no /user pra preencher as tabelas */
app.get('/testes/:id', (req, res) => {
	try{
		const users = require('./data/usuarios.json')
		const testes = JSON.parse(fs.readFileSync(`data/testes/projeto${req.params.id}.json`))
		res.send(testes)
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})

/* Rota pro fetch no /projeto pra preencher as tabelas*/
app.get('/lista/:id', (req, res) => {
	try {
		const users = require('./data/usuarios.json')
		const projetos = require('./data/projetos.json')
		const projeto = projetos.find(projeto =>  projeto.id == req.params.id)

		const lista = projeto.usuarios.map(userID => {
			const usuario = users.find(u => u.id === userID);
			return usuario
		});

		const imagem = projeto.imagem
		res.send({ lista, imagem })
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