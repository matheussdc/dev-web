const express = require('express');
const app = express() 
const logger = require('morgan')
const path = require('path')
const fs = require("fs");

app.use(logger('dev'))
app.use(express.urlencoded({ extended: true }))

const porta = 8081
app.listen(porta, function () {
	console.log(`Server listening on port ${porta}`)
})

//GET dados para página inicial
app.get('/api/projetos', (req, res) => {
	try {
		const projetos = require('./data/projetos.json')
		const total_projetos = projetos.length
		const imagensPath = []
		for(let i = 1; i <= 3 && i <= total_projetos; i++) {
			imagensPath.push(path.join(__dirname, `images/${projetos.at(-i).imagem}`))
		}
		//Envia as imagens codificadas em base64
		const imagensBase64 = imagensPath.map(imagemPath => {
			const imageBuffer = fs.readFileSync(imagemPath);
			return imageBuffer.toString('base64');
		  });
		
		let total_testes = 0
		const testes = fs.readdirSync('./data/testes')
		testes.forEach(arquivo => {
			total_testes += JSON.parse(fs.readFileSync(`./data/testes/${arquivo}`)).length
		})
		
		res.json({ imagens: imagensBase64, total_testes, total_projetos})
	} catch (error) {
		console.error(error.message)
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
//GET dados para página de testes
app.get('/api/user/:userid', (req, res) => {
	try {
		const users = require('./data/usuarios.json')
		const usuario = users.find(user => user.id == req.params.userid)
		const projetos = require('./data/projetos.json')
		const projetosUser = usuario.projetos.map(projetoId => {
			const projeto = projetos.find(p => p.id === projetoId);
			return { id: projeto.id, nome: projeto.nome };
		});
		res.json({ usuario, projetosUser })
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
app.post('/add_teste', (req, res) => {
	res.send("show mano")
})