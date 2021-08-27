"use strict";

var express = require('express');

var router = express.Router();

var app = require('../../app');

router.get('/', function (req, res, next) {
  if (req.session.username != undefined && req.session.type == "admin") {
    res.locals.title = 'Dashboard';
    res.locals.subtitle = 'Dashboard Home';
    res.render('admin/home');
  } else if (req.session.username != undefined && req.session.type == "employee") {
    res.redirect('/home');
  } else {
    res.redirect('/admin');
  }
});
router.post('/addTempOrder', function (req, res) {
  var query = "SELECT * from temp_order WHERE product_id = " + req.body.product_id;
  app.conn.query(query, function (err, result) {
    if (err) {
      console.log(err.message);
      res.locals.error = err.message;
      res.redirect('/admin/error');
    } else if (result.length == 0) {
      addNewRow(req, res);
    } else if (result.length > 0) {
      updateRow(req, res, result[0]);
    }
  });
});
router.post('/deleteTempOrderRow', function (req, res) {
  var query = "Delete from temp_order WHERE temp_order_id = " + req.body.temp_order_id;
  app.conn.query(query, function (err, result) {
    if (err) {
      res.status(200).json({
        status: "error",
        errorMessage: err.message
      });
    } else {
      res.status(200).json({
        status: "yes"
      }); // res.redirect('/admin/home');
    }
  });
});

function addNewRow(req, res) {
  var query = "INSERT INTO temp_order (product_id, product_name, unit_price, quantity, sub_total) VALUES ('" + req.body.product_id + "','" + req.body.product_name + "','" + req.body.unit_price + "','1','" + req.body.unit_price + "')";
  app.conn.query(query, function (err, result) {
    if (err) {
      res.status(200).json({
        status: "error",
        errorMessage: err.message
      });
    } else {
      res.status(200).json({
        status: "yes"
      }); // res.redirect('/admin/home');
    }
  });
}

function updateRow(req, res, result) {
  var query = "UPDATE temp_order SET quantity = '" + (result.quantity + 1) + "', sub_total = '" + (result.quantity + 1) * result.unit_price + "' WHERE product_id = " + result.product_id;
  app.conn.query(query, function (err, result) {
    if (err) {
      res.status(200).json({
        status: "error",
        errorMessage: err.message
      });
    } else {
      res.status(200).json({
        status: "yes"
      }); // res.redirect('/admin/home');
    }
  });
}

module.exports = router;