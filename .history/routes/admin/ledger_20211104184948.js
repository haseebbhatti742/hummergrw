const express = require('express')
const router = express.Router()
const app = require('../../app')

router.get('/general', (req, res, next) => {
    if (req.session.username == undefined) {
        res.redirect('/');
    } else if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Ledger'
        res.locals.subtitle = 'General'
        res.render('admin/ledger-general')
    } 
});

router.get("/get_general_ledger/:party_id/:date_from/:date_to", function(req,res){
    party_id = req.params.party_id
    date_from = req.params.date_from
    date_to = req.params.date_to
    
    if(date_from == null || date_from == "null") date_from = new Date(1960,01,01)
    if(date_to == null || date_to == "null") date_to = new Date()

    date_from = new Date(date_from)
    date_to = new Date(date_to)
    if((date_from.getMonth()+1)<10 && date_from.getDate()<10)
        date_from = date_from.getFullYear()+"-0"+(date_from.getMonth()+1)+"-0"+date_from.getDate()
    else if((date_from.getMonth()+1)>=10 && date_from.getDate()<10)
        date_from = date_from.getFullYear()+"-"+(date_from.getMonth()+1)+"-0"+date_from.getDate()
    else if((date_from.getMonth()+1)<10 && date_from.getDate()>=10)
        date_from = date_from.getFullYear()+"-0"+(date_from.getMonth()+1)+"-"+date_from.getDate()
    else if((date_from.getMonth()+1)>=10 && date_from.getDate()>=10)
        date_from = date_from.getFullYear()+"-"+(date_from.getMonth()+1)+"-"+date_from.getDate()
    
    if((date_to.getMonth()+1)<10 && date_to.getDate()<10)
        date_to = date_to.getFullYear()+"-0"+(date_to.getMonth()+1)+"-0"+date_to.getDate()
    else if((date_to.getMonth()+1)>=10 && date_to.getDate()<10)
        date_to = date_to.getFullYear()+"-"+(date_to.getMonth()+1)+"-0"+date_to.getDate()
    else if((date_to.getMonth()+1)<10 && date_to.getDate()>=10)
        date_to = date_to.getFullYear()+"-0"+(date_to.getMonth()+1)+"-"+date_to.getDate()
    else if((date_to.getMonth()+1)>=10 && date_to.getDate()>=10)
        date_to = date_to.getFullYear()+"-"+(date_to.getMonth()+1)+"-"+date_to.getDate()

    dataset = []
    date1 = new Date()
    date2 = {
        date: date1.getDate(),
        month: (date1.getMonth()+1),
        year: date1.getFullYear()
    }
    dataset.date = date2
    dataset.total_seller_weight = 0
    dataset.total_buyer_weight = 0
    dataset.total_debit = 0
    dataset.total_credit = 0
    dataset.balance = 0

    query1 = "select * from party_info where party_id = '"+party_id+"'"
    app.conn.query(query1, function(err,result1){
        if(err){
            res.render("admin/general-ledger", {status:"error", errorMessage:err.message})
        } else if(result1.length == 0){
            res.render("admin/general-ledger", {status:"error", errorMessage:"Party Not Found"})
        } else {
            dataset.party_info = result1[0]

            query2 = "select * from ledger where l_date>='"+date_from+"' AND l_date<='"+date_to+"' AND party_id = '"+party_id+"'"
            app.conn.query(query2, async function(err,result2){
                if(err){
                    res.render("admin/general-ledger", {status:"error", errorMessage:err.message})
                } else if(result2.length ==0 ){
                    res.render("admin/general-ledger", {status:"error", errorMessage:"No Record Found"})
                } else {
                    dataset.ledger = []
                    for(let i=0; i<=result2.length; i++){
                        let data
                        if(i<result2.length){
                            date3 = new Date(result2[i].l_date)
                            date4 = date3.getDate()+"/"+(date3.getMonth()+1)+"/"+date3.getFullYear()
                            result2[i].l_date = date4
                            data = result2[i]
                            
                            dataset.total_seller_weight = parseFloat(dataset.total_seller_weight) + parseFloat(result2[i].l_seller_weight)
                            dataset.total_buyer_weight = parseFloat(dataset.total_buyer_weight) + parseFloat(result2[i].l_buyer_weight)
                            dataset.total_debit = parseFloat(dataset.total_debit) + parseFloat(result2[i].l_debit)
                            dataset.total_credit = parseFloat(dataset.total_credit) + parseFloat(result2[i].l_credit)
                            dataset.balance = result2[i].l_balance

                            dataset.ledger.push(data)
                        } else if(i==result2.length){
                            total_expense = await getTotalExpenses(party_id, date_from, date_to)
                            total_recoveries = await getTotalRecoveries(party_id, date_from, date_to)
                            balance_amount = await getTotalBalance(party_id, date_from, date_to)
                            total_weight_in = await getTotalWeightsIn(party_id, date_from, date_to)
                            total_weight_out = await getTotalWeightsOut(party_id, date_from, date_to)

                            total_expense = total_expense.toLocaleString('en-US')
                            total_recoveries = total_recoveries.toLocaleString('en-US')
                            balance_amount = balance_amount.toLocaleString('en-US')
                            total_weight_in = total_weight_in.toLocaleString('en-US')
                            total_weight_out = total_weight_out.toLocaleString('en-US')
                            
                            res.render("admin/general-ledger", {status:"ok", dataset:dataset, date_from:date_from, date_to:date_to, total_expense:total_expense, total_recoveries: total_recoveries, balance_amount: balance_amount, total_weight_in:total_weight_in, total_weight_out:total_weight_out})       
                        }
                    }
                }
            })
        }
    })
})

function addIntoLedger(data){
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

            data.l_balance = data.l_balance + balance
            query2 = "insert into ledger(party_id,gp_number,cv_number,l_description,l_seller_weight,l_buyer_weight,l_rate,l_debit,l_credit,l_balance,l_date)"+
            +"values('"+data.party_id+"','"+data.gp_number+"','"+data.cv_number+"','"+data.l_description+"','"+data.l_seller_weight+"','"+data.l_buyer_weight+"','"+data.l_rate,l_debit+"','"+data.l_credit+"','"+data.l_balance+"','"+data.l_date+"')"
            
            app.conn.query(query2, function(err,result2){
                if(err){
                    resolve({status:"error", errorMessage:err.message})
                } else {
                    resolve({status:"ok", message:"Added to Ledger"})
                }
            })
        })
    })
}

function addIntoLedgerWithGP(data){
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

            data.l_balance = data.l_balance + balance
            query = "insert into ledger(party_id,gp_number,l_description,l_seller_weight,l_buyer_weight,l_rate,l_debit,l_credit,l_balance,l_date)"+
            +"values('"+data.party_id+"','"+data.gp_number+"','"+data.l_description+"','"+data.l_seller_weight+"','"+data.l_buyer_weight+"','"+data.l_rate,l_debit+"','"+data.l_credit+"','"+data.l_balance+"','"+data.l_date+"')"
            
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

            data.l_balance = data.l_balance + balance
            
            query = "insert into ledger(party_id,cv_number,l_description,l_seller_weight,l_buyer_weight,l_rate,l_debit,l_credit,l_balance,l_date)"+
            +"values('"+data.party_id+"','"+data.cv_number+"','"+data.l_description+"','"+data.l_seller_weight+"','"+data.l_buyer_weight+"','"+data.l_rate,l_debit+"','"+data.l_credit+"','"+data.l_balance+"','"+data.l_date+"')"
            
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

function getTotalExpenses(party_id, date_from, date_to){
    return new Promise(function(resolve,reject){
        query = "select * from ledger where l_debit=0 and l_credit!=0 and l_date>='"+date_from+"' AND l_date<='"+date_to+"' AND party_id = '"+party_id+"'"
        app.conn.query(query, function(err,result){
            if(err) console.log(err.message)
            else if(result.length==0) resolve(0)
            else if(result.length>0) {
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

function getTotalRecoveries(party_id, date_from, date_to){
    return new Promise(function(resolve,reject){
        query = "select * from ledger where l_debit!=0 and l_credit=0 and l_date>='"+date_from+"' AND l_date<='"+date_to+"' AND party_id = '"+party_id+"'"
        app.conn.query(query, function(err,result){
            if(err) console.log(err.message)
            else if(result.length==0) resolve(0)
            else if(result.length>0) {
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


function getTotalBalance(party_id, date_from, date_to){
    return new Promise(function(resolve,reject){
        query = "select l_balance as balance from ledger where l_date>='"+date_from+"' AND l_date<='"+date_to+"' AND party_id = '"+party_id+"' order by l_id desc limit 1"
        app.conn.query(query, function(err,result){
            if(err) {console.log(err.message)}
            else if(result.length>0) {resolve(result[0].balance)}
            else if(result.length==0) {resolve("0")}
        })
    })
}

function getTotalWeightsIn(party_id, date_from, date_to){
    return new Promise(function(resolve,reject){
        query = "select ifnull(sum(l_seller_weight),0) as total_weight_in from ledger where l_debit=0 and l_credit!=0 and l_date>='"+date_from+"' AND l_date<='"+date_to+"' AND party_id = '"+party_id+"'"
        app.conn.query(query, function(err,result){
            if(err) {console.log(err.message)}
            else if(result.length>0) {resolve(result[0].total_weight_in)}
            else if(result.length==0) {resolve("0")}
        })
    })
}

function getTotalWeightsOut(party_id, date_from, date_to){
    return new Promise(function(resolve,reject){
        query = "select ifnull(sum(l_seller_weight),0) as total_weight_out from ledger where l_debit!=0 and l_credit=0 and l_date>='"+date_from+"' AND l_date<='"+date_to+"' AND party_id = '"+party_id+"'"
        app.conn.query(query, function(err,result){
            if(err) {console.log(err.message)}
            else if(result.length>0) {resolve(result[0].total_weight_out)}
            else if(result.length==0) {resolve("0")}
        })
    })
}

module.exports.addIntoLedger = addIntoLedger
module.exports.addIntoLedgerWithGP = addIntoLedgerWithGP
module.exports.addIntoLedgerWithCV = addIntoLedgerWithCV
module.exports = router;