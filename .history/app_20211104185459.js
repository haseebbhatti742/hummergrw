//libraries
const express = require("express");
const app1 = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const mysql = require("mysql");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const cors = require("cors");
var passport = require("passport");

//settings
app1.use(cookieParser("secret"));
app1.use(flash());
app1.use(bodyParser.urlencoded({ extended: true }));
app1.use(cors());
app1.use(bodyParser.json());
app1.use(express.static("assets"));
app1.set("views", "./views");
app1.set("view engine", "jade"); // both keywords

//session management
app1.use(
  session({
    saveUninitialized: false,
    resave: true,
    secret: "ssshhhhh",
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);
app1.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app1.use(passport.initialize());
app1.use(passport.session());

//db connection
var conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "hummer_db",
});

// var conn = mysql.createPool({
//   host: "localhost",
//   user: "hummjyxk_hummer",
//   password: "hummergrw@123",
//   database: "hummjyxk_hummer_db",
// });

var conn;
conn.getConnection(function (err, con) {
  if (err) {
    console.log("DB Error!");
  } else {
    console.log("DB Connected!");
  }
});

//defining routes
const loginRoute = require("./routes/admin/login");
const homeRoute = require("./routes/admin/home");
const gatePassRoute = require("./routes/admin/gate_pass");
const cashVoucherRoute = require("./routes/admin/cash_voucher");
const advanceCashVoucherRoute = require("./routes/admin/advance_cash_voucher");
const ledgerRoute = require("./routes/admin/ledger");
const reportsRoute = require("./routes/admin/reports");
const partyRoute = require("./routes/admin/party");
const errorRoute = require("./routes/admin/error");

app1.use("/", loginRoute);
app1.use("/home", homeRoute);
app1.use("/gate_pass", gatePassRoute);
app1.use("/cash_voucher", cashVoucherRoute);
app1.use("/advance_cash_voucher", advanceCashVoucherRoute);
app1.use("/ledger", ledgerRoute);
app1.use("/reports", reportsRoute);
app1.use("/party", partyRoute);
app1.use("/error", errorRoute);

app1.use("/logout", function (req, res) {
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

// var XLSX = require('xlsx')
// app1.use("/read-excel", function(req,res){
//   var workbook = XLSX.readFile('HUMMER1.xlsx');
//   var worksheet = workbook.Sheets[workbook.SheetNames[0]];
//   const allData = [];
//   let data = {};

//   for(let cell in worksheet){
//     const cellAsString = cell.toString();

//     if(cellAsString[1] !== 'r' && cellAsString !== 'm' && cellAsString[1] > 1){
//       if(cellAsString[0] === 'A')
//         data.date = worksheet[cell].v;
//       else if(cellAsString[0] === 'B')
//         data.type = worksheet[cell].v;
//       else if(cellAsString[0] === 'C')
//         data.quantity = worksheet[cell].v;
//       else if(cellAsString[0] === 'D')
//         data.unit = worksheet[cell].v;
//       else if(cellAsString[0] === 'E')
//         data.unit_price = worksheet[cell].v;
//       else if(cellAsString[0] === 'F')
//         data.total_amount = worksheet[cell].v;
//       else if(cellAsString[0] === 'G')
//         data.details = worksheet[cell].v;
//       else if(cellAsString[0] === 'H')
//         data.part_name = worksheet[cell].v;
//       else if(cellAsString[0] === 'I')
//         data.commodity = worksheet[cell].v;
//       else if(cellAsString[0] === 'J')
//         data.balance = worksheet[cell].v;
//       else if(cellAsString[0] === 'K')
//         data.entry_code = worksheet[cell].v;
//       else if(cellAsString[0] === 'L')
//         data.cv_number = worksheet[cell].v;
//       else if(cellAsString[0] === 'M'){
//         data.gp_number = worksheet[cell].v;
//         allData.push(data);
//         data = {};
//       }
//     }
//   }

//   console.log(allData)
//   res.send(allData)
// })

module.exports.app = app1;
module.exports.conn = conn;
