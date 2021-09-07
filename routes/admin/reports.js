const express = require('express');
const router = express.Router();
const app = require('../../app');

router.get('/', (req, res, next) => {
    // if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Reports';
        res.locals.subtitle = 'Reports';
        res.render('admin/reports');
    // } else if (req.session.username == undefined) {
    //     res.render('admin/login');
    // }
});

router.get("/get_general_ledger/:party_id", function(req,res){
    party_id = req.params.party_id

    res.render("admin/reports-page")
})

module.exports = router;