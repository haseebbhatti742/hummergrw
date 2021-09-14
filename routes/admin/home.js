const express = require('express');
const router = express.Router();
const app = require('../../app');

router.get('/', async function(req, res){
    // if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Home';
        res.locals.subtitle = 'Home';

        total_expense = await getTotalExpenses()
        total_recoveries = await getTotalRecoveries()
        balance_amount = await getTotalBalance()

        res.render('admin/home', {total_expense,total_recoveries,balance_amount});
    // } else if (req.session.username == undefined) {
    //     res.render('admin/login');
    // }
});

function getTotalExpenses(){
    return new Promise(function(resolve,reject){
        query = "select ifnull(sum(l_seller_weight*l_rate),0) as total_expense from ledger where l_debit=0 and l_credit!=0"
        app.conn.query(query, function(err,result){
            if(err) console.log(err.message)
            resolve(result[0].total_expense)
        })
    })
}

function getTotalRecoveries(){
    return new Promise(function(resolve,reject){
        query = "select ifnull(sum(l_seller_weight*l_rate),0) as total_recoveries from ledger where l_debit!=0 and l_credit=0"
        app.conn.query(query, function(err,result){
            if(err) console.log(err.message)
            resolve(result[0].total_recoveries)
        })
    })
}

function getTotalBalance(){
    return new Promise(function(resolve,reject){
        query = "select l_balance as balance from ledger order by l_id desc limit 1"
        app.conn.query(query, function(err,result){
            if(err) console.log(err.message)
            resolve(result[0].balance)
        })
    })
}

module.exports = router;