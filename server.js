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

usuario = {
			user: "Gomes de Matos",
			nivel: 2
		  }

app.get('/' , (req, res) => res.render('user', usuario))

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