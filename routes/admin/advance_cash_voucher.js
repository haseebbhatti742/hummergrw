const express = require('express');
const router = express.Router();
const app = require('../../app')

router.get('/', (req, res) => {
    // if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Advance Cash Voucher';
        res.locals.subtitle = 'Cash Voucher';

        var query = "select cv_number from cash_voucher order by cv_number desc limit 1";
        app.conn.query(query, (err,result) => {
            if(err){
                res.send({error: err})
            } else {
                if(result.length == 0)
                    res.render('admin/advance_cash_voucher', {cv_number: 1});
                else
                    res.render('admin/advance_cash_voucher', {cv_number: (result[0].cv_number+1)});
            }
        })  
    // } else {
    //     res.redirect('/');
    // }
});


router.post('/add', (req, res) => {
    party_id = req.body.party_id
    cv_date = req.body.cv_date
    cv_type = req.body.cv_type
    cv_payment_type = req.body.cv_payment_type
    cv_name = req.body.cv_name
    cv_signature = req.body.cv_signature
    cv_amount = req.body.cv_amount
    cv_details = req.body.cv_details

    addCashVoucher(party_id,cv_date,cv_type,cv_payment_type,cv_name,cv_signature,cv_amount, cv_details, res)

});

function addCashVoucher(party_id,cv_date,cv_type,cv_payment_type,cv_name,cv_signature,cv_amount, cv_details, res){
    
    // if(cv_type == "Pay") { 
    //     cv_type = "Expense"
    //     cv_payment_type = "Credit"
    // } else if(cv_type == "Receive") { 
    //     cv_type = "Recovery"
    //     cv_payment_type = "Debit"
    // }

    query1 = "insert into cash_voucher (party_id, cv_date, cv_type, cv_payment_type, cv_name, cv_signature, cv_amount, cv_details) values ('"+party_id+"', '"+cv_date+"', '"+cv_type+"', '"+cv_payment_type+"', '"+cv_name+"', '"+cv_signature+"', '"+cv_amount+"', '"+cv_details+"')"
    app.conn.query(query1, function(err,result1){
        if(err){
            res.status(200).json({status: "error", errorMessage:err.message})
        } else {
            addToAccounts(party_id, cv_amount, cv_payment_type,res)
        }
    })
}

function addToAccounts(party_id, cv_amount, cv_payment_type,res){

    if(cv_payment_type == "Credit") { 
        cv_amount = -cv_amount
    }

    let query1 = "select acc_balance from accounts where party_id="+party_id+" order by acc_id desc limit 1"
    app.conn.query(query1, function(err, result1){
        if(err) {
            res.status(200).json({status:"error", errorMessage:err.message})
        } else if(result1.length == 0){
            let query2 = "insert into accounts(party_id, acc_payment_amount, acc_payment_type, acc_balance) values('"+party_id+"','"+cv_amount+"','"+cv_payment_type+"', '"+cv_amount+"')"
            app.conn.query(query2, function(err, result2){
                if(err) {
                    res.status(200).json({status:"error", errorMessage:err.message})
                } else {
                    res.status(200).json({status: "ok"})
                }
            })
        } else if(result1.length > 0){
            let query2 = "insert into accounts(party_id, acc_payment_amount, acc_payment_type, acc_balance) values('"+party_id+"','"+cv_amount+"','"+cv_payment_type+"', '"+(parseFloat(cv_amount)+parseFloat(result1[0].acc_balance))+"')"
            app.conn.query(query2, function(err, result2){
                if(err) {
                    res.status(200).json({status:"error", errorMessage:err.message})
                } else {
                    res.status(200).json({status: "ok"})
                }
            })
        } 
    })
}

module.exports = router;