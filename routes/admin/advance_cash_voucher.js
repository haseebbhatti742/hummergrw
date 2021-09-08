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

router.get('/view_all', (req, res) => {
    // if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Advance Cash Voucher';
        res.locals.subtitle = 'View All';

        var query = "select * from cash_voucher join party_info on cash_voucher.party_id=party_info.party_id where cv_type='Advance' order by cv_number desc";
        app.conn.query(query, (err,result) => {
            if(err){
                res.render('admin/view_all_advance', {status:"error", errorMessage:err.message});
            } else {
                if(result.length == 0)
                    res.render('admin/view_all_advance', {status:"error", errorMessage:"No Record Found"});
                else{
                    for(let i=0; i<result.length; i++){
                        date1 = new Date(result[i].cv_date)
                        result[i].cv_date = date1.getDate()+"/"+(date1.getMonth()+1)+"/"+date1.getFullYear()
                    }
                    res.render('admin/view_all_advance', {status:"ok", dataset:result});
                }
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
    cv_commodity = req.body.cv_commodity

    addCashVoucher(cv_commodity,party_id,cv_date,cv_type,cv_payment_type,cv_name,cv_signature,cv_amount, cv_details, res)

});

let cv_number
function addCashVoucher(cv_commodity,party_id,cv_date,cv_type,cv_payment_type,cv_name,cv_signature,cv_amount, cv_details, res){
    let ledgerData = []
    ledgerData.party_id = party_id
    ledgerData.l_commodity = cv_commodity
    ledgerData.l_date = cv_date
    ledgerData.l_description = cv_details
    ledgerData.l_seller_weight = 0
    ledgerData.l_buyer_weight = 0
    ledgerData.l_rate = 0
    ledgerData.l_balance = cv_amount
    ledgerData.l_debit = cv_amount
    ledgerData.l_credit = 0

    // if(cv_type == "Pay") { 
    //     cv_type = "Expense"
    //     cv_payment_type = "Credit"
    // } else if(cv_type == "Receive") { 
    //     cv_type = "Recovery"
    //     cv_payment_type = "Debit"
    // }

    query1 = "insert into cash_voucher (cv_commodity,party_id, cv_date, cv_type, cv_payment_type, cv_name, cv_signature, cv_amount, cv_details) values ('"+cv_commodity+"','"+party_id+"', '"+cv_date+"', '"+cv_type+"', '"+cv_payment_type+"', '"+cv_name+"', '"+cv_signature+"', '"+cv_amount+"', '"+cv_details+"')"
    app.conn.query(query1, async function(err,result1){
        if(err){
            res.status(200).json({status: "error", errorMessage:err.message})
        } else {
            ledgerData.cv_number = result1.insertId
            cv_number = result1.insertId
            l_data = await addIntoLedgerWithCV(ledgerData)
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
                    res.status(200).json({status: "ok", cv_number:cv_number})
                }
            })
        } else if(result1.length > 0){
            let query2 = "insert into accounts(party_id, acc_payment_amount, acc_payment_type, acc_balance) values('"+party_id+"','"+cv_amount+"','"+cv_payment_type+"', '"+(parseFloat(cv_amount)+parseFloat(result1[0].acc_balance))+"')"
            app.conn.query(query2, function(err, result2){
                if(err) {
                    res.status(200).json({status:"error", errorMessage:err.message})
                } else {
                    res.status(200).json({status: "ok", cv_number:cv_number})
                }
            })
        } 
    })
}

function addIntoLedgerWithCV(data){
    return new Promise(function(resolve,reject){
        query1 = "select l_balance from ledger where party_id='"+data.party_id+"' order by l_id desc limit 1"
        balance = 0;
        app.conn.query(query1, function(err,result1){
            if(err){
                resolve({status:"error", errorMessage:err.message})
            } else if (result1.length == 0){
                balance = 0;
            } else {
                balance = result1[0].l_balance
            }

            data.l_balance = parseFloat(data.l_balance) + parseFloat(balance)
            
            query1 = "insert into ledger(party_id,cv_number,l_commodity,l_description,l_seller_weight,l_buyer_weight,l_rate,l_debit,l_credit,l_balance,l_date) values('"+data.party_id+"','"+data.cv_number+"','"+data.l_commodity+"','"+data.l_description+"','"+data.l_seller_weight+"','"+data.l_buyer_weight+"','"+data.l_rate+"', '"+data.l_debit+"','"+data.l_credit+"','"+data.l_balance+"','"+data.l_date+"')"
            app.conn.query(query1, function(err,result){
                if(err){
                    resolve({status:"error", errorMessage:err.message})
                } else {
                    resolve({status:"ok", message:"Added to Ledger"})
                }
            })
        })
    })
}

module.exports = router;