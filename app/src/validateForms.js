
function validateForms(req, res, next) {
    resultado = req.body.avaliacao == 10
    next()
}

module.exports = validateForms