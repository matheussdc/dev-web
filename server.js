const express = require('express');
const app = express() 
const fs = require("fs");

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'));
app.set('view engine', 'ejs')

const porta = 8080
app.listen(porta, function () {
	console.log(`Server listening on port ${porta}`)
})

app.get('/' , (req, res) => {res.sendFile(`${__dirname}/public/user.html`)})