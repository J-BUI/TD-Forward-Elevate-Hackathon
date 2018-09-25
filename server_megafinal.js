var express = require("express");
var fs = require('fs');
var bodyParser = require("body-parser");
var path = require('path');

var HTTP_PORT = process.env.PORT || 8080;

var app = express();
app.use(express.static('public'));

var dataM = require(__dirname + '/dataManagement.js');
var allData = [];

/* API TOKEN */
const teamToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJDQlAiLCJ0ZWFtX2lkIjoiNWM1MGMwNzQtMzU3Mi0zZjQ5LWE2ZTgtZTNmMDNjNmMyN2ZjIiwiZXhwIjo5MjIzMzcyMDM2ODU0Nzc1LCJhcHBfaWQiOiIyMWY1NWNmMi02YTRkLTQxYTQtOGEwNS0zZmQ4ZmUzYWQ3MGIifQ.YJq6OHPXwdHJFI-JqderHB6R_wB1QggYmzcQjr_SThE";
const initialCustomerId = "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_12e1edc1-044d-4b20-a62a-8f8626c91231";

const util = require('util') // for printing objects
const req = require('request-promise-native'); // use Request library + promises to reduce lines of cod

// Transactions array based on preference
var trans_json = [];

// Global Variables
var AGE_MAX;
var AGE_MIN;

var INC_MIN;
var INC_MAX;

var WORK;

var CATEGORY;



app.use(bodyParser.urlencoded({
  extended: true
}));

// Initial page (Terms of Service)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/term.html'));
});

// Main page with drop down menus
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname + '/main.html'));
});

// JSON file sent to the browser
app.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname + '/transaction.json'))
});

// Saves transaction array into file and open next page to list transactions
app.post('/', (req, res) => {
  var preference = req.body;
  //console.log(preference);
  applyFilters(); // checks preferences to set global variables (see below)

  var filteredCustomers = [];
  var filteredCustomerTransactions = [];
  var j = 0;
  for (var i = 0; i < allData.length; ++i) {
    if (allData[0][i].age <= AGE_MAX &&
        allData[0][i].age >= AGE_MIN &&
       (allData[0][i].workActivity == WORK || WORK == 'ALL') &&
        allData[0][i].totalIncome <= INC_MAX &&
        allData[0][i].totalIncome >= INC_MIN) {
          
          for (var k; k < allData[1][k].length; ++k) {
            if ((allData[1][k].categoryTags[0] == CATEGORY || CATEGORY == 'ALL')) {
              filteredCustomers[j] = allData[0][i]; // store matched customer
              filteredCustomerTransactions[j] = allData[1][k]; // store macthed customer transactions
              j++
              }
            }
      //console.log(allData[0][i].givenName);
    }
  }

  fs.writeFile('transactions.json', JSON.stringify(trans_json), function (err) {
    if (err) throw err;
  });
  res.sendFile(__dirname + '/transaction.html');
});


var applyFilters = function () {
  // Age
  switch (preference.forward_pref1) {
    case "a1":
      AGE_MAX = 200;
      AGE_MIN = 0;
      break;
    case "a2":
      AGE_MAX = 18;
      AGE_MIN = 12;
      break;
    case "a3":
      AGE_MAX = 24;
      AGE_MIN = 19;
      break;
    case "a4":
      AGE_MAX = 34;
      AGE_MIN = 25;
      break;
    case "a5":
      AGE_MAX = 44;
      AGE_MIN = 35;
      break;
    case "a6":
      AGE_MAX = 54;
      AGE_MIN = 45;
      break;
    case "a7":
      AGE_MAX = 65;
      AGE_MIN = 55;
      break;
    case "a8":
      AGE_MAX = 65;
      AGE_MIN = 55;
      break;
    default:
      AGE_MAX = 200;
      AGE_MIN = 0;
  }

  // Work
  switch (preference.forward_pref2) {
    case "w1":
      WORK = 'ALL';
      break;
    case "w2":
      WORK = 'fullTime';
      break;
    case "w3":
      WORK = 'partTime';
      break;
    case "w4":
      WORK = 'null';
    default:
      WORK = 'ALL'; //
  }

  // Income
  switch (preference.forward_pref3) {
    case "i1":
      INC_MAX = Number.MAX_SAFE_INTEGER;
      INC_MIN = 0;
      break;
    case "i2":
      INC_MAX = 19999;
      INC_MIN = 0;
      break;
    case "i3":
      INC_MAX = 34999;
      INC_MIN = 20000;
      break;
    case "i4":
      INC_MAX = 49999;
      INC_MIN = 35000;
      break;
    case "i5":
      INC_MAX = 74999;
      INC_MIN = 50000;
      break;
    case "i6":
      INC_MAX = 99999;
      INC_MIN = 75000;
      break;
    default:
      INC_MAX = Number.MAX_SAFE_INTEGER;
      INC_MIN = 0;
  }

  // Category
  switch (preference.forward_pref4) {
    case "t1":
      CATEGORY = 'ALL';
      break;
    case "t2":
      CATEGORY = 'Auto and Transport';
      break;
    case "t3":
      CATEGORY = 'Bills and Utilities';
      break;
    case "t4":
      CATEGORY = 'Entertainment';
      break;
    case "t5":
      CATEGORY = 'Food and Dining';
      break;
    case "t6":
      CATEGORY = 'Mortgage and Rent';
      break;
    case "t7":
      CATEGORY = 'Shopping';
    default:
      CATEGORY = 'ALL';
  }
}




// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, function () {
  console.log("Server running on port: " + HTTP_PORT);
  dataM.loadData()
    .then(function (resp) {
      allData = resp;
    });
});