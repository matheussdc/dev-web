
function validateForms(req, res, next) {
    console.log(req.body)
    resultado = req.body.avaliacao == 10
    next()
}

module.exports = validateForms