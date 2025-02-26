const express = require('express');
const app = express();
const axios = require('axios');
const multer = require('multer')
const FormData = require('form-data');
const path = require('path')
const fs = require("fs");
const validateForms = require('./src/validateForms.js')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.set('view engine', 'ejs')

const upload = multer({ 
    // Armazena arquivos no disco
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, 'uploads'));
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    }),
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
})

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

/* POST novo usuário */
app.post('/signup', async (req, res) => {
	const response = await axios.post(url_api + '/api/user', JSON.stringify(req.body),
										{
											headers: {
												'Content-Type': 'application/json'
											}
										})
	const data = response.data
	if(data.success) {
		res.redirect(`/user/${data.id}`)
	}
	else { res.sendStatus(404) }
})

/* GET user.html */
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

/* GET projeto.html */
app.get('/projeto/:userid', async (req, res) => {
	//GET /projeto
	try {
		const response = await axios.get(url_api + `/api/projetos/${req.params.userid}`)
		const data = response.data
		if(data.success){
			res.render('projeto', {
				usuario: data.usuario,
				projetos: data.projetos,
				lista: data.lista
			})
		}
		else { res.redirect('/') }
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})

/* GET Assíncrono no /user pra preencher as tabelas */
app.get('/testes/:id', async (req, res) => {
	try{
		const response = await axios.get(url_api + `/api/projeto/${req.params.id}/testes`)
		const data = response.data
		if(data.success){ res.send(data.testes) }
		else {res.sendStatus(404)}
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})

/* GET Assíncrono no /projeto pra preencher as tabelas*/
app.get('/lista/:id', async (req, res) => {
	try {
		const response = await axios.get(url_api + `/api/projeto/${req.params.id}`)
		const data = response.data
		res.send({ lista: data.lista, imagem: data.imagem })
	}
	catch (error) {
		console.error(error.message)
		res.sendStatus(404)
	}
})

/* POST novo projeto */
app.post('/addProjeto', upload.single('imagem'), async (req, res) => {
	if(req.file.mimetype.includes('image')) {
		const form = new FormData()
		form.append('imagem', fs.createReadStream(req.file.path), {
			filename: req.file.filename,
			contentType: req.file.mimetype
		})
		form.append('nome', req.body.nome)
		try {
			const response = await axios.post(url_api + '/api/projeto', form, {
				headers: {
					...form.getHeaders()
				}
			})
			const data = response.data
			res.redirect('back')
			//res.location(req.get("Referrer") || "/")
		} catch (error) {
			res.sendStatus(404)
		} finally {
			fs.unlink(req.file.path, (err) => {
				if (err) { console.error('Erro ao remover arquivo temporário:', err) }
				else { console.log('Arquivo temporário removido:', req.file.path) }
			})
		}
	}
	else {
		res.sendStatus(404)
	}
})

/* Recebe o formulário preenchido, valida e cria um teste relacionado ao projeto especificado */
app.post('/add_teste', validateForms, async (req, res) => {
	const pid = req.body.projeto_id
	const response = await axios.post(url_api + `/api/projeto/${pid}/teste`,
										JSON.stringify(req.body),
										{
											headers: {
												'Content-Type': 'application/json'
											}
										})
	const data = response.data
	res.redirect('back')
})
/* POST para alterar dados de um registro */
app.post('/edit_teste', async (req, res) => {
	const pid = req.body.projeto_id
	const tid = req.body.teste_id
	const response = await axios.put(url_api + `/api/projeto/${pid}/teste/${tid}`,
										JSON.stringify(req.body),
										{
											headers: {
												'Content-Type': 'application/json'
											}
										})
	const data = response.data
	res.redirect('back')
})
app.post('/delTeste/:pid/:tid', async (req, res) => {
	const tid = req.params.tid
	const pid = req.params.pid
	try{
		const response = await axios.delete(url_api + `/api/projeto/${pid}/teste/${tid}`)
		const data = response.data
		if(data.success) {
			res.send({ success: true, teste: data.teste })
		}
		else {
			res.send({ success: false, message: data.message })
		}
	} catch(error) {
		console.error(error.message)
		res.status(404).send({ message: 'seila' })
	}
})