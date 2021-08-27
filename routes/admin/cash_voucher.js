const express = require('express');
const router = express.Router();
const app = require('../../app')

router.get('/', (req, res) => {
    // if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Cash Voucher';
        res.locals.subtitle = 'Cash Voucher';
        res.render('admin/cash_voucher');
    // } else {
    //     res.redirect('/');
    // }
});

router.get('/cv_form', (req, res) => {
    res.render('admin/cash_voucher_form1');
});

module.exports = router;