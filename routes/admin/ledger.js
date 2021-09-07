const express = require('express')
const router = express.Router()
const app = require('../../app')

router.get('/general', (req, res, next) => {
    // if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Ledger'
        res.locals.subtitle = 'General'
        res.render('admin/ledger-general')
    // } else if (req.session.username == undefined) {
    //     res.render('admin/login');
    // }
});

router.get("/get_general_ledger/:party_id", function(req,res){
    party_id = req.params.party_id
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

            query2 = "select * from ledger where party_id = '"+party_id+"'"
            app.conn.query(query2, function(err,result2){
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
                            res.render("admin/general-ledger", {status:"ok", dataset})       
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
module.exports.addIntoLedger = addIntoLedger
module.exports.addIntoLedgerWithGP = addIntoLedgerWithGP
module.exports.addIntoLedgerWithCV = addIntoLedgerWithCV
module.exports = router;