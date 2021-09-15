const express = require('express');
const router = express.Router();
const app = require('../../app')
const ledger = require("../admin/ledger")

router.get('/', (req, res) => {
    if (req.session.username != undefined && req.session.type == "admin") {
        res.locals.title = 'Gate Pass';
        res.locals.subtitle = 'Gate Pass';

        var query_for_gp_number = "select gp_number from gate_pass order by gp_number desc limit 1";
        app.conn.query(query_for_gp_number, (err,result) => {
            if(err){
                res.send({error: err})
            } else {
                if(result.length == 0)
                    res.render('admin/gate_pass', {gp_number: 1});
                else
                    res.render('admin/gate_pass', {gp_number: (result[0].gp_number+1)});
            }
        })
    } else {
        res.redirect('/');
    }
});

router.post("/add-gate-pass", function(req,res){
    addGatePass(req,res);
})

router.get("/view-gate-pass/:gp_number", function(req,res){
    res.locals.title = "Gate Pass"
    res.locals.subtitle = "View Gate Pass"
    dataset = []
    query = "select * from gate_pass join party_info on gate_pass.gp_party_id=party_info.party_id where gp_number='"+req.params.gp_number+"' OR gp_number_manual='"+req.params.gp_number+"'"
    app.conn.query(query, function(err,result){
        if(err){
            res.locals.errorMessage = err.message
            res.redirect("/error")
        } else if (result.length == 0){
            res.render("view-gate-pass", {status:"error", errorMessage:"No Record Found"})
        } else {
            dataset.gate_pass = result[0]
            date1 = new Date(result[0].gp_date)
            date2={
                date: date1.getDate(),
                month: (date1.getMonth()+1),
                year: date1.getFullYear(),
            }

            dataset.gate_pass.gp_date = date2.date+"/"+date2.month+"/"+date2.year
            app.conn.query("select * from gp_entries where gp_number="+dataset.gate_pass.gp_number, function(err,result2){
                if(err){
                    res.locals.errorMessage = err.message
                    res.redirect("/error")
                } else {
                    dataset.gp_entries = result2
                    res.render("admin/view-gate-pass", {status:"ok", dataset:dataset})
                }
            })
        }
    })
})

router.get('/cv_form', (req, res) => {
    var query = "select cv_number from cash_voucher order by cv_number desc limit 1";
    app.conn.query(query, (err,result) => {
        if(err){
            res.send({error: err})
        } else {
            if(result.length == 0)
                res.render('admin/cash_voucher_form2', {cv_number: 1});
            else
                res.render('admin/cash_voucher_form2', {cv_number: (result[0].cv_number+1)});
        }
    })
});

router.post("/get-contact", function(req,res){
    app.conn.query("select party_contact from party_info where party_id="+req.body.party_id, function(err,result){
        if(err){
            res.status(200).json({status:"error", errorMessage:err.message})
        } else if(result.length == 0 || result[0].party_contact == undefined || result[0].party_contact == null){
            res.status(200).json({status:"ok", contact:""})
        } else if(result.length > 0 && (result[0].party_contact != undefined || result[0].party_contact != null)){
            res.status(200).json({status:"ok", contact:result[0].party_contact})
        }
    })
})

gp_number =0
async function addGatePass(req,res){
    ledgerDataObject = []

    let gp_number_manual = req.body.gp_number_manual;
    let gp_type = req.body.gate_pass_type;
    let gp_date = req.body.gate_pass_date;
    let gate_pass_party_id = req.body.gate_pass_party_id;
    let gate_pass_party_name = req.body.gate_pass_party_name;
    let gp_contact = req.body.gate_pass_contact;
    let gate_pass_grand_total = req.body.gate_pass_grand_total;
    let gp_payment_type = req.body.gate_pass_payment_type;
    let gp_row = req.body.gp_entries;
    let cash_voucher = req.body.cash_voucher
    let gp_total = 0;

    if(gp_type == "in") {
        gp_type = "Expense"
        gp_payment_type = "Credit"
    }
    else if(gp_type == "out") {
        gp_type = "Recovery"
        gp_payment_type = "Debit"
    }

    isGp = await checkGp(gp_number_manual)
    if(isGp == true){
        res.status(200).json({status:"error", errorMessage:"Manual Gate Pass Number Already Exists"})
    } else {
        var query1 = "insert into gate_pass(gp_number_manual,gp_party_id,gp_type,gp_date,gp_contact, gp_payment_type) values('"+gp_number_manual+"','"+gate_pass_party_id+"','"+gp_type+"','"+gp_date+"','"+gp_contact+"', '"+gp_payment_type+"')";
        app.conn.query(query1, async function(err,result){
            if(err){
                res.status(200).json({status:"error", errorMessage:err.message})
                console.log("Error1: "+err.message)
            } else {
                gp_number = result.insertId;
                for(let i=0; i<=gp_row.length; i++){
                    let ledgerData = {}
                    if(i<gp_row.length){
                        let gp_commodity = gp_row[i].commodity 
                        var gp_quantity = gp_row[i].quantity
                        let gp_unit = gp_row[i].unit
                        let gp_unit_amount = gp_row[i].unit_amount
                        let gp_total_amount = gp_row[i].total_amount
                        let gp_details = gp_row[i].details;
                        gp_total += parseFloat(gp_total_amount);
                        
                        if(gp_payment_type == "Credit"){ ledgerData.l_balance = -ledgerData.l_balance }

                        ledgerData.l_seller_weight = gp_quantity
                        ledgerData.l_commodity = gp_commodity
                        ledgerData.l_buyer_weight = 0
                        ledgerData.l_rate = gp_unit_amount
                        ledgerData.l_description = gp_details

                        if(gp_type == "Expense") {
                            ledgerData.l_debit = 0
                            ledgerData.l_credit = -gate_pass_grand_total
                            ledgerData.l_balance = ledgerData.l_credit
                        }
                        else if(gp_type == "Recovery") {
                            ledgerData.l_debit = gate_pass_grand_total
                            ledgerData.l_balance = ledgerData.l_debit
                            ledgerData.l_credit = 0
                        }
                    
                        ledgerData.party_id = gate_pass_party_id
                        ledgerData.gp_number_manual = gp_number_manual
                        ledgerData.l_date = gp_date
                        //ledgerData.l_balance = gate_pass_grand_total

                        let query2 = "insert into gp_entries(gp_number, gp_commodity, gp_unit, gp_quantity, gp_buyer_weight, gp_unit_amount, gp_total_amount, gp_details) values('"+gp_number+"','"+gp_commodity+"','"+gp_unit+"','"+gp_quantity+"', '0', '"+gp_unit_amount+"','"+gp_total_amount+"','"+gp_details+"')"
                        app.conn.query(query2, function(err, result2){
                            if(err) {
                                res.status(200).json({status:"error", errorMessage:err.message})
                                console.log("Error2: "+err.message)
                            }
                            //gp_number  = result2.insertId
                            ledgerData.gp_number = gp_number
                            ledgerDataObject.push(ledgerData)
                        })
                    } else if (i==gp_row.length){
                        let query3 = "update gate_pass set gp_total = '"+gp_total+"' where gp_number = "+gp_number
                        app.conn.query(query3,async function(err, result3){
                            if(err) {
                                res.status(200).json({status:"error", errorMessage:err.message})
                                console.log("Error3: "+err.message)
                            }
                            else {
                                if(gp_payment_type == "Credit"){ gp_total = -gp_total }

                                if(cash_voucher == "false"){
                                    l_data = await addIntoLedgerWithGP(ledgerDataObject)
                                    addToAccounts(gate_pass_party_id, gp_total, gp_payment_type,res)
                                } else if(cash_voucher == "true"){
                                    cash_voucher_type = req.body.cash_voucher_type
                                    cash_voucher_signature = req.body.cash_voucher_signature
                                    cash_voucher_details = req.body.cash_voucher_details

                                    addCashVoucher(gp_number, gate_pass_party_id,gp_date,gp_type,cash_voucher_type,gate_pass_party_name,cash_voucher_signature,gp_total, cash_voucher_details, res)
                                }
                            }
                        })
                    }
                }
            }
        })
    }
}

function editGatePass(req,res){
    ledgerDataObject = []

    let gp_number = req.body.gate_pass_number;
    let gp_type = req.body.gate_pass_type;
    let gp_date = req.body.gate_pass_date;
    let gp_party_id = req.body.gate_pass_party_id;
    let gate_pass_party_name = req.body.gate_pass_party_name;
    let gp_total = req.body.gate_pass_grand_total;
    let gp_payment_type = req.body.gate_pass_payment_type;
    let gp_contact = req.body.gate_pass_contact;
    let gp_entries = req.body.gp_entries;
    let cash_voucher = req.body.cash_voucher;
    
    if(gp_type == "in") gp_type = "Expense"
    else if(gp_type == "out") gp_type = "Recovery"

    var query = "update gate_pass set gp_party_id='"+gp_party_id+"', gp_type='"+gp_type+"', gp_date='"+gp_date+"', gp_contact='"+gp_contact+"', gp_total='"+gp_total+"' where gp_number="+gp_number
    app.conn.query(query, async function(err,result1){
        if(err){
            res.status(200).json({status:"error", errorMessage:err.message})
        } else {
            for(let i=0; i<=gp_entries.length; i++){
                let ledgerData = {}
                if(i<gp_entries.length){

                    if(gp_payment_type == "Credit"){ ledgerData.l_balance = -ledgerData.l_balance }
                    ledgerData.l_commodity = gp_entries[i].commodity
                    ledgerData.l_seller_weight = gp_entries[i].quantity
                    ledgerData.l_buyer_weight = gp_entries[i].buyer_weight
                    ledgerData.l_rate = gp_entries[i].unit_amount
                    ledgerData.l_description = gp_entries[i].details

                    if(gp_type == "Expense") {
                        ledgerData.l_debit = 0
                        ledgerData.l_credit = -gp_total
                        ledgerData.l_balance = ledgerData.l_credit
                    }
                    else if(gp_type == "Recovery") {
                        ledgerData.l_debit = gp_total
                        ledgerData.l_balance = ledgerData.l_debit
                        ledgerData.l_credit = 0
                    }
                
                    ledgerData.party_id = gp_party_id
                    ledgerData.l_date = gp_date
                    //ledgerData.l_balance = gate_pass_grand_total

                    let query2 = "update gp_entries set gp_commodity='"+gp_entries[i].commodity+"', gp_unit='"+gp_entries[i].unit+"', gp_quantity='"+gp_entries[i].quantity+"', gp_buyer_weight='"+gp_entries[i].buyer_weight+"', gp_unit_amount='"+gp_entries[i].unit_amount+"', gp_total_amount='"+gp_entries[i].total_amount+"', gp_details='"+gp_entries[i].details+"' where gp_entry_id="+gp_entries[i].entry_id
                    app.conn.query(query2, function(err,result2){
                        if(err){
                            console.log(err.message)
                            res.status(200).json({status:"error", errorMessage:err.message})
                        }
                        //gp_number  = result2.insertId
                        ledgerData.gp_number = gp_number
                        ledgerDataObject.push(ledgerData)
                    })
                } else if(i==gp_entries.length){
                    let query3 = "select * from gate_pass order by gp_number desc limit 1"
                    app.conn.query(query3,async function(err, result3){
                        if(err) {
                            res.status(200).json({status:"error", errorMessage:err.message})
                            console.log("Error3: "+err.message)
                        }
                        else {
                            if(gp_payment_type == "Credit"){ gp_total = -gp_total }

                            if(cash_voucher == "false"){
                                if(0 == 0) l_data = await addIntoLedgerWithGP(ledgerDataObject)
                                addToAccounts(gp_party_id, gp_total, gp_payment_type,res)
                            } else if(cash_voucher == "true"){
                                cash_voucher_type = req.body.cash_voucher_type
                                cash_voucher_signature = req.body.cash_voucher_signature
                                cash_voucher_details = req.body.cash_voucher_details

                                addCashVoucher(gp_number, gp_party_id,gp_date,gp_type,cash_voucher_type,gate_pass_party_name,cash_voucher_signature,gp_total, cash_voucher_details, res)
                            }
                        }
                    })
                }
            }
        }
    })
}

router.post('/getParty', async function(req, res) {
    var party = await getParty();
    res.status(200).json({ status: "yes", party: party });
})

function getParty() {
    var parties = [];
    return new Promise(function(resolve, reject) {
        app.conn.query('select party_id, party_name from party_info', function(err,result) {
            if(err){
                console.log(err.message)
            } else {
                for(let i=0; i<result.length; i++){
                    var obj = {};
                    obj['party_id'] = result[i].party_id;
                    obj['party_name'] = result[i].party_name;
                    parties.push(obj);
                }
            }
            resolve(parties);
        })
    })
}

router.get("/getGatePass/:searchId", function(req,res){
    searchId = req.params.searchId;
    app.conn.query("select * from gate_pass where gp_number='"+searchId+"'", function(err,result1){
        if(err){
            console.log("Error1: "+err.message)
            res.status(200).json({found:"error", errorMessage:err.message})
        } else if(result1.length == 0){
            res.render("admin/edit_gate_pass", {found:"no"})
            // res.status(200).json({found:"no"})
        } else {
            date = new Date(result1[0].gp_date)
            if((date.getMonth()+1) < 10)
                result1[0].gp_date = date.getFullYear()+"-0"+(date.getMonth()+1)+"-"+date.getDate()
            else
                result1[0].gp_date = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()
            
            app.conn.query("select party_name from party_info where party_id="+result1[0].gp_party_id, function(err,result3){
                result1[0].gp_party_name = result3[0].party_name
            })
            
            app.conn.query("select * from gp_entries where gp_number="+searchId, function(err,result2){
                if(err){
                    console.log("Error2: "+err.message)
                    res.status(200).json({found:"error", errorMessage:err.message}) 
                } else {
                    res.render("admin/edit_gate_pass", {found:"yes", gate_pass:result1[0], gp_entries: result2})
                    // res.status(200).json({found:"yes", gate_pass:result1[0], gp_entries: result2})
                }
            })      
        }
    })
})

router.post("/edit-gate-pass", function(req,res){
    editGatePass(req,res)
})

function addCashVoucher(gp_number, party_id,cv_date,cv_type,cv_payment_type,cv_name,cv_signature,cv_amount, cv_details, res){
    
    if(cv_type == "Pay") { 
        cv_type = "Expense"
        cv_payment_type = "Credit"
    } else if(cv_type == "Receive") { 
        cv_type = "Recovery"
        cv_payment_type = "Debit"
    }

    query1 = "insert into cash_voucher (gp_number, party_id, cv_date, cv_type, cv_payment_type, cv_name, cv_signature, cv_amount, cv_details) values ('"+gp_number+"', '"+party_id+"', '"+cv_date+"', '"+cv_type+"', '"+cv_payment_type+"', '"+cv_name+"', '"+cv_signature+"', '"+cv_amount+"', '"+cv_details+"')"
    app.conn.query(query1, async function(err,result1){
        if(err){
            res.status(200).json({status: "error", errorMessage:err.message})
        } else {
            cv_number = result1.insertId
            for(let i=0; i<ledgerDataObject.length; i++){
                ledgerDataObject[i].cv_number = cv_number
                if(cv_type == "Expense") { 
                    ledgerDataObject[i].l_balance = -ledgerDataObject[i].l_balance
                } 
            }

            l_data = await addIntoLedger(ledgerDataObject)
            addToAccounts(party_id, cv_amount, cv_payment_type,res)
        }
    })
}

function addToAccounts(party_id, cv_amount, cv_payment_type,res){
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
                    res.status(200).json({status: "ok", gp_number:gp_number})
                }
            })
        } else if(result1.length > 0){
            let query2 = "insert into accounts(party_id, acc_payment_amount, acc_payment_type, acc_balance) values('"+party_id+"','"+cv_amount+"','"+cv_payment_type+"', '"+(parseFloat(cv_amount)+parseFloat(result1[0].acc_balance))+"')"
            app.conn.query(query2, function(err, result2){
                if(err) {
                    res.status(200).json({status:"error", errorMessage:err.message})
                } else {
                    res.status(200).json({status: "ok", gp_number:gp_number})
                }
            })
        } 
    })
}

function addIntoLedger(data){
    return new Promise(function(resolve,reject){
        query1 = "select l_balance from ledger where party_id='"+data[0].party_id+"' order by l_id desc limit 1"
        balance = 0;
        app.conn.query(query1, function(err,result1){
            if(err){
                resolve({status:"error", errorMessage:err.message})
            } else if (result1.length == 0){
                balance = 0;
            } else {
                balance = result1[0].l_balance
            }

            data[0].l_balance = parseFloat(data[0].l_balance) + parseFloat(balance)
            for(let i=0; i<=data.length; i++){   
                if(i<data.length){
                    query2 = "insert into ledger(party_id,gp_number,gp_number_manual,cv_number,l_commodity,l_description,l_seller_weight,l_buyer_weight,l_rate,l_debit,l_credit,l_balance,l_date) values('"+data[i].party_id+"','"+data[i].gp_number+"','"+data[i].gp_number_manual+"','"+data[i].cv_number+"','"+data[i].l_commodity+"','"+data[i].l_description+"','"+data[i].l_seller_weight+"','"+data[i].l_buyer_weight+"','"+data[i].l_rate+"','"+data[i].l_debit+"','"+data[i].l_credit+"','"+data[0].l_balance+"','"+data[i].l_date+"')"
                    app.conn.query(query2, function(err,result){})
                } else if (i==data.length){
                    resolve({status:"ok", message:"Added to Ledger"})
                }
            }

        })
    })
}

function addIntoLedgerWithGP(data){
    return new Promise(function(resolve,reject){
        query1 = "select l_balance from ledger where party_id='"+data[0].party_id+"' order by l_id desc limit 1"
        balance = 0;
        app.conn.query(query1, function(err,result1){
            if(err){
                resolve({status:"error", errorMessage:err.message})
            } else if (result1.length == 0){
                balance = 0;
            } else {
                balance = result1[0].l_balance
            }

            data[0].l_balance = parseFloat(data[0].l_balance) + parseFloat(balance)
            for(let i=0; i<=data.length; i++){   
                if(i<data.length){
                    query2 = "insert into ledger(party_id,gp_number,gp_number_manual,l_commodity,l_description,l_seller_weight,l_buyer_weight,l_rate,l_debit,l_credit,l_balance,l_date) values('"+data[i].party_id+"','"+data[i].gp_number+"','"+data[i].gp_number_manual+"','"+data[i].l_commodity+"','"+data[i].l_description+"','"+data[i].l_seller_weight+"','"+data[i].l_buyer_weight+"','"+data[i].l_rate+"','"+data[i].l_debit+"','"+data[i].l_credit+"','"+data[0].l_balance+"','"+data[i].l_date+"')"
                    app.conn.query(query2, function(err,result){
                        if(err){
                            console.log(err.message)
                        }
                    })
                } else if (i==data.length){
                    resolve({status:"ok", message:"Added to Ledger"})
                }
            }

        })
    })
}

function checkGp(gp_number_manual){
    return new Promise(function(resolve,reject){
        app.conn.query("select * from gate_pass where gp_number_manual='"+gp_number_manual+"'", function(err,result){
            if(err){
                console.log(err.message)
            } else if(result.length == 0){
                resolve(false)
            } else if(result.length > 0){
                resolve(true)
            } 
        })
    })
}

router.post("/check-gp-manual", function(req,res){
    return new Promise(function(resolve,reject){
        app.conn.query("select * from gate_pass where gp_number_manual='"+req.body.gp_number_manual+"'", function(err,result){
            if(err){
                console.log(err.message)
            } else if(result.length == 0){
                resolve(false)
            } else if(result.length > 0){
                resolve(true)
            } 
        })
    })
})

module.exports = router;