const express = require('express');
const router = express.Router();
const app = require('../../app');

router.get('/', (req, res, next) => {
    // if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Home';
        res.locals.subtitle = 'Home';
        res.render('admin/home');
    // } else if (req.session.username == undefined) {
    //     res.render('admin/login');
    // }
});

module.exports = router;