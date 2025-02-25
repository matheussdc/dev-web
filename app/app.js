const express = require('express');
const app = express();
const axios = require('axios');
//const multer = require(multer)
const fs = require("fs");
const validateForms = require('./src/validateForms.js')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.set('view engine', 'ejs')

const url_api = 'http://localhost:8081' //`http://${process.env.HOST}:${process.env.PORT}`

const porta = 8080
app.listen(porta, function () {
	console.log(`Server listening on port ${porta}`)
})

/* GET index.html */
app.get('/', async (req, res) => {
	try {
		const response = await axios.get(url_api + '/api/projetos')
		const data = response.data

		res.render('index', {
			imagens: data.imagens,
			total_testes: data.total_testes,
			total_projetos: data.total_projetos })
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})


app.post('/login', (req, res) => {
	//POST /login
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

app.get('/user/:userid', async (req, res) => {
	//GET /user
	try {
		const response = await axios.get(url_api + `/api/user/${req.params.userid}`)
		const data = response.data

		res.render('user', {
			usuario: data.usuario,
			projetosUser: data.projetosUser })
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})

app.get('/projeto/:userid', (req, res) => {
	//GET /projeto
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
	//GET /testes
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