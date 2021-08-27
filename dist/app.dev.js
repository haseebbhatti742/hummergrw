"use strict";

//libraries
var express = require('express');

var app1 = express();

var bodyParser = require('body-parser');

var session = require('express-session');

var mysql = require('mysql');

var cookieParser = require('cookie-parser');

var flash = require('connect-flash'); //settings


app1.use(cookieParser('secret'));
app1.use(flash());
app1.use(bodyParser.json({
  limit: '50mb'
}));
app1.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app1.use(bodyParser.json());
app1.use(express["static"]('assets')); // views and default location for views

app1.set('views', './views');
app1.set('view engine', 'jade'); // both keywords
//session management

app1.use(session({
  saveUninitialized: false,
  resave: true,
  secret: 'ssshhhhh',
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));
app1.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
}); //db connection

var conn = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pos_coderax'
});
var conn;
conn.getConnection(function (err, con) {
  if (err) {
    console.log("DB Error!");
  } else {
    console.log("DB Connected!");
  }
}); //deifining routes

var loginRoute = require("./routes/admin/login");

var homeRoute = require("./routes/admin/home");

var productsRoute = require("./routes/admin/products");

var employeesRoute = require("./routes/admin/employees");

var categoriesRoute = require("./routes/admin/categories");

var tempOrderRoute = require("./routes/admin/temp-order");

var errorRoute = require("./routes/admin/error");

app1.use("/admin", loginRoute);
app1.use("/admin/home", homeRoute);
app1.use("/admin/products", productsRoute);
app1.use("/admin/employees", employeesRoute);
app1.use("/admin/categories", categoriesRoute);
app1.use("/admin/temp-order", tempOrderRoute);
app1.use("/admin/error", errorRoute);
app1.use("/admin/logout", function (req, res) {
  req.session.destroy(function (err) {
    res.redirect("/admin");
  });
});
module.exports.app = app1;
module.exports.conn = conn;