const jwt = require("jsonwebtoken");
exports.authJwt = (req, res, next) => {
    if (req.cookies && req.cookies.token) {
        jwt.verify(req.cookies.token, "Souvik@123", (err, data) => {
            req.user = data
            next()
        })
    } else {
        next()
    }
}