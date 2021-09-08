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

router.post("/get_report", function(req,res){
    party_id = req.body.party_id
    report_type = req.body.report_type
    report_commodity = req.body.report_commodity
    report_date_from = req.body.report_date_from
    report_date_to = req.body.report_date_to

    filter_party = " party_id='"+party_id+"' AND "
    filter_report_type = " "
    filter_commodity = " "

    if(report_date_from == "") {report_date_from = new Date(1960,01,01)}
    if(report_date_to == "") {report_date_to = new Date()}
    if(party_id == "") { filter_party = " " }
    
    report_date_from = new Date(report_date_from)
    report_date_to = new Date(report_date_to)
    report_date_from = report_date_from.getFullYear()+"-0"+(report_date_from.getMonth()+1)+"-0"+report_date_from.getDate()
    report_date_to = report_date_to.getFullYear()+"-0"+(report_date_to.getMonth()+1)+"-0"+report_date_to.getDate()
    
    let query    
    if(report_type == "") { filter_report_type = " " }
    if(report_type == "Expense") { filter_report_type = " l_debit=0 AND l_credit>=0 AND " }
    if(report_type == "Recovery"){ filter_report_type = " l_debit>=0 AND l_credit=0 AND " }
    if(report_commodity != ""){ filter_commodity = " l_commodity='"+report_commodity+"' AND " }
    filter_date = " l_date>='"+report_date_from+"' AND l_date<='"+report_date_to+"'"
    
    query = "select * from ledger where "+filter_party+filter_report_type+filter_commodity+filter_date
    app.conn.query(query, function(err,result){
        if(err) res.render("admin/reports-page", {status:"error", erroeMessage: err.message})
        else {
            for(let i=0; i<result.length; i++){
                date = new Date(result[i].l_date)
                result[i].l_date = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()
            }
            result.date_from = report_date_from
            result.date_to = report_date_to
            res.render("admin/reports-page", {status:"ok", dataset: result})
        }
    })
})

module.exports = router;