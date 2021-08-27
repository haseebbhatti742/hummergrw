"use strict";

var express = require('express');

var router = express.Router();

var app = require('../../app');

router.get('/', function (req, res, next) {
  if (req.session.username != undefined && req.session.type == "admin") {
    res.locals.title = 'Categories';
    res.locals.subtitle = 'Categories';
    var query = "SELECT * FROM categories";
    app.conn.query(query, function (err, categories_result) {
      if (err) {
        console.log(err.message);
        res.locals.error = err.message;
        res.redirect('/admin/error');
      } else {
        var query2 = "SELECT * FROM sub_categories";
        app.conn.query(query2, function (err, sub_categories_result) {
          if (err) {
            console.log(err.message);
            res.locals.error = err.message;
            res.redirect('/admin/error');
          } else {
            res.render('admin/categories', {
              categories: categories_result,
              sub_categories: sub_categories_result
            });
          }
        });
      }
    });
  } else if (req.session.username != undefined && req.session.type == "employee") {
    res.redirect('/home');
  } else {
    res.redirect('/admin');
  }
});
router.post('/add', function (req, res) {
  var query = "INSERT INTO categories (category) VALUES ('" + req.body.category + "')";
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
router.post('/addSubCategory', function (req, res) {
  var query = "INSERT INTO sub_categories (category_id, sub_category) VALUES ('" + req.body.category_id + "', '" + req.body.newSubCategory + "')";
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
module.exports = router;