const express = require('express');
const router = express.Router();
const app = require('../../app')

router.get('/', (req, res) => {
    // if (req.session.username != undefined && req.session.type == "admin") {
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
    // } else {
    //     res.redirect('/');
    // }
});

router.post("/add-gate-pass", function(req,res){
    addGatePass(req,res);
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

function addGatePass(req,res){
    let gp_type = req.body.gate_pass_type;
    let gp_date = req.body.gate_pass_date;
    let gate_pass_party_id = req.body.gate_pass_party_id;
    let gate_pass_party_name = req.body.gate_pass_party_name;
    let gp_contact = req.body.gate_pass_contact;
    let gp_payment_type = req.body.gate_pass_payment_type;
    let gp_row = req.body.gp_entries;
    let cash_voucher = req.body.cash_voucher
    let gp_total = 0;
    let gp_number = 0;

    if(gp_type == "in") gp_type = "Expense"
    else if(gp_type == "out") gp_type = "Recovery"

    var query1 = "insert into gate_pass(gp_party_id,gp_type,gp_date,gp_contact, gp_payment_type) values('"+gate_pass_party_id+"','"+gp_type+"','"+gp_date+"','"+gp_contact+"', '"+gp_payment_type+"')";
    app.conn.query(query1, function(err,result){
        if(err){
            res.status(200).json({status:"error", errorMessage:err.message})
            console.log("Error1: "+err.message)
        } else {
            gp_number = result.insertId;
            for(let i=0; i<=gp_row.length; i++){
                if(i<gp_row.length){
                    let gp_commodity = gp_row[i].commodity 
                    let gp_quantity = gp_row[i].quantity
                    let gp_unit = gp_row[i].unit
                    let gp_unit_amount = gp_row[i].unit_amount
                    let gp_total_amount = gp_row[i].total_amount
                    let gp_details = gp_row[i].details;
                    gp_total += parseFloat(gp_total_amount);

                    let query2 = "insert into gp_entries(gp_number, gp_commodity, gp_unit, gp_quantity, gp_buyer_weight, gp_tare_weight, gp_net_weight, gp_unit_amount, gp_total_amount, gp_details) values('"+gp_number+"','"+gp_commodity+"','"+gp_unit+"','"+gp_quantity+"', '0', '0', '0', '"+gp_unit_amount+"','"+gp_total_amount+"','"+gp_details+"')"
                    app.conn.query(query2, function(err, result2){
                        if(err) {
                            res.status(200).json({status:"error", errorMessage:err.message})
                            console.log("Error2: "+err.message)
                        }
                        gp_number  = result2.insertId
                    })
                } else if (i==gp_row.length){
                    let query3 = "update gate_pass set gp_total = '"+gp_total+"' where gp_number = "+gp_number
                    app.conn.query(query3, function(err, result3){
                        if(err) {
                            res.status(200).json({status:"error", errorMessage:err.message})
                            console.log("Error3: "+err.message)
                        }
                        else {
                            if(gp_payment_type == "Credit"){ gp_total = -gp_total }

                            if(cash_voucher == "false"){
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

function editGatePass(req,res){
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

    let query = "update gate_pass set gp_party_id='"+gp_party_id+"', gp_type='"+gp_type+"', gp_date='"+gp_date+"', gp_contact='"+gp_contact+"', gp_total='"+gp_total+"' where gp_number="+gp_number
    app.conn.query(query, function(err,result1){
        if(err){
            res.status(200).json({status:"error", errorMessage:err.message})
        } else {
            for(var i=0; i<=gp_entries.length; i++){
                if(i<gp_entries.length){
                    let query2 = "update gp_entries set gp_commodity='"+gp_entries[i].commodity+"', gp_unit='"+gp_entries[i].unit+"', gp_quantity='"+gp_entries[i].quantity+"', gp_buyer_weight='"+gp_entries[i].buyer_weight+"', gp_unit_amount='"+gp_entries[i].unit_amount+"', gp_total_amount='"+gp_entries[i].total_amount+"', gp_details='"+gp_entries[i].details+"' where gp_entry_id="+gp_entries[i].entry_id
                    app.conn.query(query2, function(err,result2){
                        if(err){
                            console.log(err.message)
                            res.status(200).json({status:"error", errorMessage:err.message})
                        }
                    })
                } else if(i==gp_entries.length){
                    if(gp_payment_type == "Credit"){ gp_total = -gp_total }

                    if(cash_voucher == "false"){
                        // res.status(200).json({status:"ok"})
                        addToAccounts(gp_party_id, gp_total, gp_payment_type,res)
                    } else if(cash_voucher == "true"){
                        cash_voucher_type = req.body.cash_voucher_type
                        cash_voucher_signature = req.body.cash_voucher_signature
                        cash_voucher_details = req.body.cash_voucher_details

                        addCashVoucher(gp_number, gp_party_id,gp_date,gp_type,cash_voucher_type,gate_pass_party_name,cash_voucher_signature,gp_total, cash_voucher_details, res)
                    }
                }
            }
        }
    })
}

router.post("/add-party", function(req,res){
    app.conn.query("insert into party_info(party_name, party_contact) values('"+req.body.party_name+"','"+req.body.party_contact+"')", function(err,result){
        if(err){
            res.status(200).json({ status: "error", errorMessage:err.message});
        } else {
            res.status(200).json({ status: "ok"});
        }
    })
})

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
    app.conn.query(query1, function(err,result1){
        if(err){
            res.status(200).json({status: "error", errorMessage:err.message})
        } else {
            addToAccounts(party_id, cv_amount, cv_payment_type,res)
        }
    })
}

function addToAccounts(party_id, cv_amount, cv_payment_type,res){

    // if(cv_payment_type == "Credit") { 
    //     cv_amount = -cv_amount
    // }

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