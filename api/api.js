const express = require('express');
const app = express()
const multer = require('multer')
const path = require('path')
const fs = require("fs");
const logger = require('morgan')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const upload = multer({ 
	// Armazena arquivos no disco
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, path.resolve(__dirname, 'images'));
		},
		filename: (req, file, cb) => {
			cb(null, file.originalname);
		}
	}),
	limits: { fileSize: 20 * 1024 * 1024 } // 20MB
})

const lastID = (tipo, pid) => {
	let fonte;
	if(tipo == 'user'){ fonte = require('./data/usuarios.json') }
	if(tipo == 'projeto'){ fonte = require('./data/projetos.json') }
	if(tipo == 'teste') { fonte = require(`./data/testes/projeto${pid}.json`) }
	return fonte.reduce((max, coisa) => {return max > parseInt(coisa.id) ? max : parseInt(coisa.id)}, 0)
}

const porta = 8081
app.listen(porta, function () {
	console.log(`Server listening on port ${porta}`)
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
//POST novo usuário cadastrado
app.post('/api/user', (req, res) => {
	const user = req.body
	const users = require('./data/usuarios.json')
	const novoUser = {
		id: lastID('user') + 1,
		nome: user.nome,
		cargo: user.cargo,
		email: user.email,
		senha: user.password,
		nivel: 1,
		projetos: []
	}
	users.push(novoUser)
	fs.writeFileSync('./data/usuarios.json', JSON.stringify(users, {}, 4))

	res.status(201).json({ success: true, id: novoUser.id })
})
//GET dados para página de testes
app.get('/api/user/:userid', (req, res) => {
	try {
		const users = require('./data/usuarios.json')
		const usuario = users.find(user => user.id == req.params.userid)
		const projetos = require('./data/projetos.json')
		let projetosUser;
		if(usuario.nivel == 3) {
			projetosUser = projetos.map(projeto => {
				return { id: projeto.id, nome: projeto.nome };
			})
		}
		else {
			projetosUser = usuario.projetos.map(projetoId => {
				const projeto = projetos.find(p => p.id === projetoId);
				return { id: projeto.id, nome: projeto.nome };
			});
		}
		res.json({ usuario, projetosUser })
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
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
//GET dados para página de projetos
app.get('/api/projetos/:userid', (req, res) => {
	try {
		const users = require('./data/usuarios.json')
		const usuario = users.find(user => user.id == req.params.userid)
		const lista = users.map(user => {return { id:user.id, nome: user.nome }})
		const projetosJSON = require('./data/projetos.json')
		const projetos = projetosJSON.map(projeto => {return { id: projeto.id, nome: projeto.nome }})
		if(usuario.nivel == 3) {
			res.json({ success: true, usuario, projetos, lista })
		}
		else {
			res.json({ success: false })
		}
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})
//GET dados para preencher tabela de acesso
app.get('/api/projeto/:pid', (req, res) => {
	try {
		const users = require('./data/usuarios.json')
		const projetos = require('./data/projetos.json')
		const projeto = projetos.find(projeto =>  projeto.id == req.params.pid)

		const lista = projeto.usuarios.map(userID => {
			const usuario = users.find(u => u.id === userID);
			return usuario
		});

		const imagemPath = path.join(__dirname, `images/${projeto.imagem}`)
		const imagemBase64 = fs.readFileSync(imagemPath).toString('base64')
		res.json({ lista, imagem: imagemBase64 })
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})
//POST novo projeto criado
app.post('/api/projeto', upload.single('imagem'), (req, res) => {
	const novoProjeto = {
		id: lastID('projeto') + 1,
		nome: req.body.nome,
		imagem: req.file.filename,
		usuarios: []
	}
	const users = require('./data/usuarios.json')
	const admins = users.filter(u => {return u.nivel == 3}).map(u => u.id)
	novoProjeto.usuarios = admins

	const projetos = require('./data/projetos.json')
	projetos.push(novoProjeto)
	fs.writeFileSync('./data/projetos.json', JSON.stringify(projetos, {}, 4))
	fs.writeFileSync(`./data/testes/projeto${novoProjeto.id}.json`, JSON.stringify([]))
	res.status(201).json({ success: true, id: novoProjeto.id })
})
//GET dados para preencher tabela de testes
app.get('/api/projeto/:pid/testes', (req, res) => {
	try{
		const testes = JSON.parse(fs.readFileSync(`data/testes/projeto${req.params.pid}.json`))
		res.json({success: true, testes})
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})
//POST novo teste registrado
app.post('/api/projeto/:pid/teste', (req, res) => {
	const teste = req.body
	const testes = require(`./data/testes/projeto${req.params.pid}.json`)
	const novoTeste = {
		id: String(lastID('teste', req.params.pid) + 1).padStart(3, '0'),
		hardware: teste.hardware,
		modelo: teste.modelo,
		temperatura: teste.temperatura,
		pressao: teste.pressao,
		altura: teste.altura,
		data: teste.data,
		avaliacao: teste.avaliacao,
		resultado: teste.avaliacao == 10 ? true : false,
		detalhes: teste.detalhes
	}
	testes.push(novoTeste)
	fs.writeFileSync(`./data/testes/projeto${req.params.pid}.json`, JSON.stringify(testes, {}, 4))

	res.status(201).json({ success: true, id: novoTeste.id })
})
//DELETE registro de teste
app.delete('/api/projeto/:pid/teste/:tid', (req, res) => {
	const testes = require(`./data/testes/projeto${req.params.pid}.json`)
	const aSerDeletado = testes.find(teste => parseInt(teste.id) == req.params.tid)
	if(aSerDeletado) {
		testes.splice(testes.indexOf(aSerDeletado), 1)
        fs.writeFileSync(`./data/testes/projeto${req.params.pid}.json`, JSON.stringify(testes, {}, 4))
        res.status(200).json({ success: true, teste: aSerDeletado})
	}
	else {
		res.status(404).send({ success: false, message: "ID não encontrado" })
	}
})

app.put('/api/projeto/:pid/teste/:tid', (req, res) => {
	const teste = req.body
	const testes = require(`./data/testes/projeto${req.params.pid}.json`)
	const attTeste = {
		id: teste.teste_id,
		hardware: teste.hardware,
		modelo: teste.modelo,
		temperatura: teste.temperatura,
		pressao: teste.pressao,
		altura: teste.altura,
		data: teste.data,
		avaliacao: teste.avaliacao,
		resultado: teste.avaliacao == 10 ? true : false,
		detalhes: teste.detalhes
	}
	testes.splice(testes.indexOf(attTeste), 1, attTeste)
	fs.writeFileSync(`./data/testes/projeto${req.params.pid}.json`, JSON.stringify(testes, {}, 4))

	res.status(201).json({ success: true, id: attTeste.id })
})