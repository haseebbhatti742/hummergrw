const express = require('express')
const router = express.Router()
const app = require('../../app')

router.get('/add-party', (req, res, next) => {
    if (req.session.username == undefined) {
        res.redirect('/');
    } else if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Party'
        res.locals.subtitle = 'Add Party'
        res.render('admin/party')
    }
});

router.post("/add", function(req,res){
    app.conn.query("select * from party_info where party_contact='"+req.body.party_contact+"'", function(err,result1){
        if(err){
            res.status(200).json({ status: "error", errorMessage:err.message});
        } else if(result1.length > 0){
            res.status(200).json({ status: "no", errorMessage:"Contact Already Exists...!"});
        } else if(result1.length == 0){
            app.conn.query("insert into party_info(party_name, party_contact) values('"+req.body.party_name+"','"+req.body.party_contact+"')", function(err,result){
                if(err){
                    res.status(200).json({ status: "error", errorMessage:err.message});
                } else {
                    res.status(200).json({ status: "ok"});
                }
            })
        }
    })
})

module.exports = router;