const express = require('express');
const router = express.Router();
const app = require('../../app');

router.get('/', (req, res, next) => {
    if (req.session.username == undefined) {
        res.render('admin/login');
    } else if (req.session.username != undefined && req.session.type == "admin") {
        res.redirect('/home');
    }
});

router.post("/login", function(req, res) {
    var query = "SELECT * from admin where (username = '" + req.body.username + "') AND password= '" + req.body.password + "'";
    app.conn.query(query, function(err, result) {
        if (err) {
            res.status(200).json({ status: "error", errorMessage: err.message })
        } else if (result.length == 0) {
            res.status(200).json({ status: "no" })
        } else {
            req.session.username = result[0].username;
            req.session.name = result[0].name;
            req.session.type = "admin";
            res.status(200).json({ status: "yes" })
        }
    })
})

module.exports = router;