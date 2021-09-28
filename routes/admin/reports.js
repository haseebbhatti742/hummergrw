const express = require('express');
const router = express.Router();
const app = require('../../app');

let filter_party,filter_report_type,filter_commodity,filter_date

router.get('/', (req, res) => {
    if (req.session.username == undefined) {
        res.redirect('/');
    } else if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Reports';
        res.locals.subtitle = 'Reports';
        res.render('admin/reports');
    }
});

router.get("/get_report/:party_id/:report_type/:report_commodity/:report_date_from/:report_date_to", function(req,res){
    party_id = req.params.party_id
    report_type = req.params.report_type
    report_commodity = req.params.report_commodity
    report_date_from = req.params.report_date_from
    report_date_to = req.params.report_date_to

    filter_party = " ledger.party_id='"+party_id+"' AND "
    filter_report_type = " "
    filter_commodity = " "

    if(report_date_from == "" || report_date_from == "null") {report_date_from = new Date(1960,01,01)}
    if(report_date_to == "" || report_date_to == "null") {report_date_to = new Date()}
    if(party_id == "" || party_id == "null") { filter_party = " " }
    
    report_date_from = new Date(report_date_from)
    report_date_to = new Date(report_date_to)
    
    if((report_date_from.getMonth()+1)<10 && report_date_from.getDate()<10)
        report_date_from = report_date_from.getFullYear()+"-0"+(report_date_from.getMonth()+1)+"-0"+report_date_from.getDate()
    else if((report_date_from.getMonth()+1)>=10 && report_date_from.getDate()<10)
        report_date_from = report_date_from.getFullYear()+"-"+(report_date_from.getMonth()+1)+"-0"+report_date_from.getDate()
    else if((report_date_from.getMonth()+1)<10 && report_date_from.getDate()>=10)
        report_date_from = report_date_from.getFullYear()+"-0"+(report_date_from.getMonth()+1)+"-"+report_date_from.getDate()
    else if((report_date_from.getMonth()+1)>=10 && report_date_from.getDate()>=10)
        report_date_from = report_date_from.getFullYear()+"-"+(report_date_from.getMonth()+1)+"-"+report_date_from.getDate()
    
    if((report_date_to.getMonth()+1)<10 && report_date_to.getDate()<10)
        report_date_to = report_date_to.getFullYear()+"-0"+(report_date_to.getMonth()+1)+"-0"+report_date_to.getDate()
    else if((report_date_to.getMonth()+1)>=10 && report_date_to.getDate()<10)
        report_date_to = report_date_to.getFullYear()+"-"+(report_date_to.getMonth()+1)+"-0"+report_date_to.getDate()
    else if((report_date_to.getMonth()+1)<10 && report_date_to.getDate()>=10)
        report_date_to = report_date_to.getFullYear()+"-0"+(report_date_to.getMonth()+1)+"-"+report_date_to.getDate()
    else if((report_date_to.getMonth()+1)>=10 && report_date_to.getDate()>=10)
        report_date_to = report_date_to.getFullYear()+"-"+(report_date_to.getMonth()+1)+"-"+report_date_to.getDate()
    
    let query    
    if(report_type == "" || report_type == "null") { filter_report_type = " " }
    if(report_commodity == "" || report_commodity == "null") { report_commodity = "" }
    if(report_type == "Expense") { filter_report_type = " l_type='Expense' AND " }
    if(report_type == "Recovery"){ filter_report_type = " l_type='Recovery' AND " }
    if(report_commodity != ""){ filter_commodity = " l_commodity='"+report_commodity+"' AND " }
    filter_date = " l_date>='"+report_date_from+"' AND l_date<='"+report_date_to+"'"
    
    let party_join = " join party_info on ledger.party_id=party_info.party_id "

    query = "select * from ledger "+party_join+" where "+filter_party+filter_report_type+filter_commodity+filter_date
    app.conn.query(query, async function(err,result){
        if(err) { res.render("admin/reports-page", {status:"error", erroeMessage: err.message}) }
        else if(result.length == 0){
            res.render("admin/reports-page", {status:"error", errorMessage:"Record Not Found"})
        } else {
            for(let i=0; i<result.length; i++){
                date = new Date(result[i].l_date)
                result[i].l_date = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()
            }
            result.date_from = report_date_from
            result.date_to = report_date_to

            total_expense = await getTotalExpenses()
            total_recoveries = await getTotalRecoveries()
            balance_amount = await getTotalBalance()
            total_weight_in = await getTotalWeightsIn()
            total_weight_out = await getTotalWeightsOut()

            total_expense = total_expense.toLocaleString('en-US')
            total_recoveries = total_recoveries.toLocaleString('en-US')
            balance_amount = balance_amount.toLocaleString('en-US')
            total_weight_in = total_weight_in.toLocaleString('en-US')
            total_weight_out = total_weight_out.toLocaleString('en-US')

            res.render("admin/reports-page", {status:"ok", dataset: result, total_expense:total_expense, total_recoveries: total_recoveries, balance_amount: balance_amount, total_weight_in:total_weight_in, total_weight_out:total_weight_out})
        }
    })
})

function getTotalExpenses(){
    return new Promise(function(resolve,reject){
        query = "select * from ledger where l_debit=0 and l_credit!=0 and "+filter_party+filter_report_type+filter_commodity+filter_date
        app.conn.query(query, function(err,result){
            if(err) console.log(err.message)
            else if(result.length==0) resolve(0)
            else{
                let total_expense = 0
                for(let i=0; i<result.length; i++){
                    if(i==0) total_expense = result[i].l_credit
                    else {
                        if(result[i].l_credit != result[i-1].l_credit){
                            total_expense = parseFloat(total_expense)+parseFloat(result[i].l_credit)
                        }
                    }
                }
                resolve(total_expense)
            }
        })
    })
}

function getTotalRecoveries(){
    return new Promise(function(resolve,reject){
        query = "select * from ledger where l_debit!=0 and l_credit=0 and "+filter_party+filter_report_type+filter_commodity+filter_date
        app.conn.query(query, function(err,result){
            if(err) console.log(err.message)
            else if(result.length==0) resolve(0)
            else {
                let total_recoveries = 0
                for(let i=0; i<result.length; i++){
                    if(i==0) total_recoveries = result[i].l_debit
                    else {
                        if(result[i].l_debit != result[i-1].l_debit){
                            total_recoveries = parseFloat(total_recoveries)+parseFloat(result[i].l_debit)
                        }
                    }
                }
                resolve(total_recoveries)
            }
        })
    })
}

function getTotalBalance(){
    return new Promise(function(resolve,reject){
        query = "select l_balance as balance from ledger where "+filter_party+filter_report_type+filter_commodity+filter_date+" order by l_id desc limit 1"
        app.conn.query(query, function(err,result){
            if(err) {console.log(err.message)}
            else if(result.length>0) {resolve(result[0].balance)}
            else if(result.length==0) {resolve("0")}
        })
    })
}

function getTotalWeightsIn(){
    return new Promise(function(resolve,reject){
        query = "select ifnull(sum(l_seller_weight),0) as total_weight_in from ledger where l_debit=0 and l_credit!=0 and "+filter_party+filter_report_type+filter_commodity+filter_date
        app.conn.query(query, function(err,result){
            if(err) {console.log(err.message)}
            else if(result.length>0) {resolve(result[0].total_weight_in)}
            else if(result.length==0) {resolve("0")}
        })
    })
}

function getTotalWeightsOut(){
    return new Promise(function(resolve,reject){
        query = "select ifnull(sum(l_seller_weight),0) as total_weight_out from ledger where l_debit!=0 and l_credit=0 and "+filter_party+filter_report_type+filter_commodity+filter_date
        app.conn.query(query, function(err,result){
            if(err) {console.log(err.message)}
            else if(result.length>0) {resolve(result[0].total_weight_out)}
            else if(result.length==0) {resolve("0")}
        })
    })
}

module.exports = router;