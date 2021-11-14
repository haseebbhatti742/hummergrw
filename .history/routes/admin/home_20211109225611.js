const express = require("express");
const router = express.Router();
const app = require("../../app");

router.get("/", async function (req, res) {
  if (req.session.username == undefined) {
    res.redirect("/");
  } else if (req.session.username != undefined && req.session.type == "admin") {
    res.locals.title = "Home";
    res.locals.subtitle = "Home";
    req.session.company_name = "MS Yard";

    let total_expense = await getTotalExpenses();
    let total_recoveries = await getTotalRecoveries();
    let balance_amount = await getTotalBalance();
    let total_weight_in = await getTotalWeightsIn();
    let total_weight_out = await getTotalWeightsOut();
    let balance_weight = total_weight_out - total_weight_in;

    total_expense = parseFloat(total_expense.toFixed(2)).toLocaleString();
    total_recoveries = parseFloat(total_recoveries.toFixed(2)).toLocaleString();
    balance_amount = parseFloat(balance_amount.toFixed(2)).toLocaleString();
    total_weight_in = parseFloat(total_weight_in.toFixed(2)).toLocaleString();
    total_weight_out = parseFloat(total_weight_out.toFixed(2)).toLocaleString();
    balance_weight = parseFloat(balance_weight.toFixed(2)).toLocaleString();

    res.render("admin/home", {
      total_expense,
      total_recoveries,
      balance_amount,
      total_weight_in,
      total_weight_out,
      balance_weight,
    });
  }
});

function getTotalExpenses() {
  return new Promise(function (resolve, reject) {
    query = "select * from ledger where l_debit=0 and l_credit!=0";
    app.conn.query(query, function (err, result) {
      if (err) console.log(err.message);
      else if (result.length == 0) resolve(0);
      else if (result.length > 0) {
        let total_expense = 0;
        for (let i = 0; i < result.length; i++) {
          if (i == 0) total_expense = result[i].l_credit;
          else {
            if (result[i].l_credit != result[i - 1].l_credit) {
              total_expense =
                parseFloat(total_expense) + parseFloat(result[i].l_credit);
            }
          }
        }
        resolve(total_expense);
      }
    });
  });
}

function getTotalRecoveries() {
  return new Promise(function (resolve, reject) {
    query = "select * from ledger where l_debit!=0 and l_credit=0";
    app.conn.query(query, function (err, result) {
      if (err) console.log(err.message);
      else if (result.length == 0) resolve(0);
      else if (result.length > 0) {
        let total_recoveries = 0;
        for (let i = 0; i < result.length; i++) {
          if (i == 0) total_recoveries = result[i].l_debit;
          else {
            if (result[i].l_debit != result[i - 1].l_debit) {
              total_recoveries =
                parseFloat(total_recoveries) + parseFloat(result[i].l_debit);
            }
          }
        }
        resolve(total_recoveries);
      }
    });
  });
}

function getTotalBalance() {
  return new Promise(function (resolve, reject) {
    // query =
    //   "select l_balance as balance from ledger order by l_id desc limit 1";
    query =
      "SELECT l_balance FROM `ledger` GROUP BY party_id ORDER BY party_id DESC";
    app.conn.query(query, function (err, result) {
      if (err) {
        console.log(err.message);
      } else if (result.length == 0) {
        resolve("0");
      } else if (result.length > 0) {
        let balance = 0;
        for (let i = 0; i <= result.length; i++) {
          if (i < result.length)
            balance = parseFloat(balance) + parseFloat(result[i].l_balance);
          else if (i == result.length) resolve(balance);
        }
      }
    });
  });
}

function getTotalWeightsIn() {
  return new Promise(function (resolve, reject) {
    query =
      "select ifnull(sum(l_seller_weight),0) as total_weight_in from ledger where l_debit=0 and l_credit!=0";
    app.conn.query(query, function (err, result) {
      if (err) {
        console.log(err.message);
      } else if (result.length > 0) {
        resolve(result[0].total_weight_in);
      } else if (result.length == 0) {
        resolve("0");
      }
    });
  });
}

function getTotalWeightsOut() {
  return new Promise(function (resolve, reject) {
    query =
      "select ifnull(sum(l_seller_weight),0) as total_weight_out from ledger where l_debit!=0 and l_credit=0";
    app.conn.query(query, function (err, result) {
      if (err) {
        console.log(err.message);
      } else if (result.length > 0) {
        resolve(result[0].total_weight_out);
      } else if (result.length == 0) {
        resolve("0");
      }
    });
  });
}

module.exports = router;