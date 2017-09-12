// Greeter deploy script
// Author : Toon Leijtens
// Date   : 12-09-2017
// Version: 1.0
//
// This is a script to illustrate how contracts can be deployed from nodejs
// using web3.js with generic and custom web3 extensions.

var fs = require('fs');
var web3_extended = require('web3_extended');

var options = {
  host: 'http://127.0.0.1:8545',
  ipc: true,
  personal: true, 
  admin: true,
  debug: false
};

var web3 = web3_extended.create(options);

// extend web3.eth with getTransactionReceiptMined.js
web3.eth.getTransactionReceiptMined = require("./getTransactionReceiptMined.js");

// ToDo: implement the extensions to the personal object similar to getTransactionReceiptMined.js
//
if( options.personal) {

  // Add lockAccount to the web3 extended object
  web3._extend({
        property: 'personal',
        methods: [new web3._extend.Method({
            name: 'lockAccount',
            call: 'personal_lockAccount',
            params: 1,
            inputFormatter: [web3._extend.utils.toAddress]
        })]
      });
}
//
// ----------------------------------------------------------------------------------------------

// Unlock the coinbase account to create transactions
console.log("Unlocking account : " + web3.eth.accounts[0]);
var password = process.env.ENV_PASSWD;
var coinbase = web3.eth.accounts[0];

try {
  var result = web3.personal.unlockAccount(coinbase, password, 0)
  if(result) console.log("Account unlocked.");
} catch(e) {
  console.log(e);
  return;
}

// THIS COMMAND TO PRODUCE greeter.json.
// solc greeter.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > greeter.json
console.log(": load greeter.json");

// ToDo: call solc from this script
//
let source = fs.readFileSync("greeter.json");
let contracts = JSON.parse(source)["contracts"];
//
// --------------------------------

let abi = JSON.parse(contracts['greeter.sol:greeter'].abi);
let code = '0x' + contracts['greeter.sol:greeter'].bin;

let greeterContract = web3.eth.contract(abi);
let deployObject = {from:coinbase,data:code,gas:3000000};

console.log(": deploy contract ...");

let greeterInstance = greeterContract.new("Hello Master.", deployObject);

return web3.eth.getTransactionReceiptMined( greeterInstance.transactionHash)
  .then( function(receipt) {
    console.log(": greeter contract deployed at address = " + receipt.contractAddress);
    web3.personal.lockAccount(coinbase);
    console.log("Account locked. -- Fin --");
});
