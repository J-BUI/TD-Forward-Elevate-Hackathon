var customers = [
  { ID: "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_39ff2dc1-e430-4498-a645-155e83e05403" }, // Caesar
  { ID: "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_c418b5e6-ef7a-4774-88bc-762f2e9adc53" }, // Jenny
  { ID: "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_9c8b689c-daec-4fe6-836d-07d36f9dbcc9" }, // Aubreanna
  { ID: "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_82d48a68-9d96-4815-9167-625041b6a132" }, // Phillipa
  { ID: "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_1e3a6b98-02b7-42da-99dc-1f8fa58bb012" },
  { ID: "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_e4af825b-3c1f-4429-9cf2-94c8f88ba62a" },
  { ID: "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_c18dca28-f10f-4a0a-b905-db636046bd4c" },
  { ID: "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_be23d561-0198-4876-9d23-2a5e67bad5ff" }
];

var fs = require('fs');
var bodyParser = require("body-parser");
var moment = require("moment");

var customerInformation = [];   // store complete customer info
var customerLastDayTransactions = [];

const teamToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJDQlAiLCJ0ZWFtX2lkIjoiNWM1MGMwNzQtMzU3Mi0zZjQ5LWE2ZTgtZTNmMDNjNmMyN2ZjIiwiZXhwIjo5MjIzMzcyMDM2ODU0Nzc1LCJhcHBfaWQiOiIyMWY1NWNmMi02YTRkLTQxYTQtOGEwNS0zZmQ4ZmUzYWQ3MGIifQ.YJq6OHPXwdHJFI-JqderHB6R_wB1QggYmzcQjr_SThE";
const donor = "21f55cf2-6a4d-41a4-8a05-3fd8fe3ad70b_12e1edc1-044d-4b20-a62a-8f8626c91231";

const util = require('util') // for printing objects
const req = require('request-promise-native'); // use Request library + promises to reduce lines of code

function options(method, uri, body = null) {
  return {
    json: true,
    body: body,
    uri: 'https://api.td-davinci.com/api/' + uri,
    method: method,
    headers: { 'Authorization': teamToken }
  };
}

(function () {
  exports.makeTransaction = function (from, to, reas, amm) {
    var transactionBody = {
      amount: amm,
      currency: "CAD",
      fromAccountID: from,
      receipt: reas,
      toAccountID: to
    };

    var cust = {};
    (function () {
       req(options('POST', 'transfers/', transactionBody))
        .then((resp) => {
          cust = resp.result;
          console.log(cust.receipt);
          console.log(cust.transactionTime);
          console.log(cust.transactionType);
        }, handleError)
    })();
  }

  exports.loadData = function () {
    return new Promise(function (resolve, reject) {
      for (var i = 0; i < customers.length; ++i) {
        (function () {
          req(options('GET', 'customers/' + customers[i].ID))
            .then((resp) => {
              customerInformation.push(resp.result);
              //console.log(customerInformation[i].givenName); // debugging purposes
            }, handleError)
        })();

        // Pull customer last day transactions - Anthony

         (function () {
          req(options('GET', 'customers/' + customers[i].ID + '/transactions'))
            .then((resp) => {
              var trans = resp.result;

              var dateOffset = 2; // 1 day past for some reason

              var oldDate = new Date();
              oldDate.setDate(oldDate.getDate() - dateOffset);

              for (var j = 0; j < trans.length; ++j) {
                if (moment(trans[j].originationDateTime).isAfter(oldDate)) {
                  customerLastDayTransactions.push(trans[j]);
                  //console.log(customerLastDayTransactions[i].merchantName);
                }
              }
            }, handleError)
        })();
      }
      //console.log(customerLastDayTransactions[i].merchantName);
      if (1)//customerInformation.length > 0 && customerLastDayTransactions.length > 0)
        resolve([ customerInformation, customerLastDayTransactions ]);
      else reject("load data failed");
    });
  }


  
}())

function handleError(err) {
  let outErr = err;
  if (err.response) {
    if (err.response.body) {
      outErr = err.response.body;
      console.dir(outErr.errorDetails);
    } else {
      outErr = err.response;
    }
  }
  console.dir(outErr);
  process.exit(1);
}