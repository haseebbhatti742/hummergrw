"use strict";

var express = require('express');

var router = express.Router();

var app = require('../../app');

router.get('/add', function (req, res, next) {
  if (req.session.username != undefined && req.session.type == "admin") {
    res.locals.title = 'Products';
    res.locals.subtitle = 'Add Products';
    res.render('admin/product-add');
  } else if (req.session.username != undefined && req.session.type == "employee") {
    res.redirect('/home');
  } else {
    res.redirect('/admin');
  }
});
router.get('/view', function (req, res, next) {
  if (req.session.username != undefined && req.session.type == "admin") {
    res.locals.title = 'Products';
    res.locals.subtitle = 'View Products';
    var query = "SELECT * from product ORDER BY product_id DESC";
    app.conn.query(query, function (err, result) {
      if (err) {
        console.log(err.message);
        res.locals.error = err.message;
        res.redirect('/admin/error');
      } else if (result.length == 0) {
        res.render('admin/products-view', {
          length: result.length,
          dataset: result
        });
      } else if (result.length > 0) {
        res.render('admin/products-view', {
          length: result.length,
          dataset: result
        });
      }
    });
  } else if (req.session.username != undefined && req.session.type == "employee") {
    res.redirect('/home');
  } else {
    res.redirect('/admin');
  }
});
router.post('/getCategory', function (req, res) {
  var query = "SELECT * from categories";
  app.conn.query(query, function (err, result) {
    if (err) {
      res.status(200).json({
        status: "error",
        msg: err.message
      });
    } else if (result.length > 0) {
      res.status(200).json({
        status: "yes",
        category: result
      });
    }
  });
});
router.post('/getSubCategory', function (req, res) {
  var query = "SELECT * from sub_categories WHERE category_id=(SELECT category_id FROM categories WHERE category='" + req.body.name + "')";
  app.conn.query(query, function (err, result) {
    if (err) {
      res.status(200).json({
        status: "error",
        msg: err.message
      });
    } else if (result.length > 0) {
      res.status(200).json({
        status: "yes",
        sub_category: result
      });
    }
  });
});
router.post('/product-add', function (req, res) {
  var query = "INSERT INTO product (product_name, product_selling_price, product_actual_price, product_quantity, product_size, product_category ,product_sub_category, product_desc, product_status) VALUES ('" + req.body.product_name + "','" + req.body.product_selling_price + "','" + req.body.product_actual_price + "','" + req.body.product_quantity + "','" + req.body.product_size + "','" + req.body.product_category + "','" + req.body.product_sub_category + "','" + req.body.product_desc + "','available')";
  app.conn.query(query, function (err, result) {
    if (err) {
      res.status(200).json({
        status: "error",
        errorMessage: err.message
      });
    } else {
      res.status(200).json({
        status: "ok"
      });
    }
  });
});
router.post('/get', function (req, res, next) {
  var query = "SELECT * from product WHERE product_id = " + req.body.product_id;
  app.conn.query(query, function (err, result) {
    if (err) {
      res.status(200).json({
        status: "error",
        errorMessage: err.message
      });
    } else if (result.length == 0) {
      res.status(200).json({
        status: "no"
      });
    } else if (result.length > 0) {
      res.status(200).json({
        status: "yes",
        length: result.length,
        dataset: result
      });
    }
  });
});
module.exports = router;