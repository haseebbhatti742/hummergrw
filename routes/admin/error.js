const express = require('express');
const router = express.Router();
const app = require('../../app');

router.get('/', (req, res, next) => {
    if (req.session.username != undefined && req.session.type == "admin") {
        res.render('admin/error');
    } else if (req.session.username != undefined && req.session.type == "employee") {
        res.render('/error');
    } else if (req.session.username == undefined) {
        res.redirect('/admin');
    }
});

module.exports = router;