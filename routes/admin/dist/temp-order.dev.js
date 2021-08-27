"use strict";

var express = require('express');

var router = express.Router();

var app = require('../../app');

router.get('/', function (req, res, next) {
  var query = "SELECT * from temp_order";
  app.conn.query(query, function (err, result) {
    if (err) {
      console.log(err.message);
    } else {
      var query2 = "SELECT sum(sub_total) as total from temp_order";
      app.conn.query(query2, function (err, result2) {
        if (err) {
          console.log(err.message);
          res.locals.error = err.message;
          res.redirect('/admin/error');
        } else {
          res.render('admin/temp-order', {
            length: result.length,
            temp_order: result,
            total: result2[0].total
          });
        }
      }); // var total = getTotal();
      // var total = 150;
      // console.log(total);
      // setTimeout(function() {
      //     res.render('admin/temp-order', { length: result.length, temp_order: result, total: total });
      // }, 100)
    }
  });
});

function getTotal() {
  var query = "SELECT sum(sub_total) as total from temp_order";
  app.conn.query(query, function (err, result) {
    if (err) {
      return null;
    } else {
      var total = result[0].total; // console.log(total);

      return total;
    }
  });
}

module.exports = router;