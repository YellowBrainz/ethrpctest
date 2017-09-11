var web3_extended = require('web3_extended');
var Promise = require('bluebird');
var fs = require('fs');
 
var options = {
  host: 'http://127.0.0.1:8545',
  ipc:true,
  personal: true, 
  admin: true,
  debug: false
};
var web3 = web3_extended.create(options);
 
var datadir = web3.admin.datadir();
console.log("Datadir = " + datadir);

// Unlock the coinbase account to make transactions out of it
console.log("Unlocking account : " + web3.eth.accounts[0]);
var password = process.env.ENV_PASSWD;
var coinbase = web3.eth.accounts[0];

try {
  var lock_result = web3.personal.unlockAccount(coinbase, password, 0)
} catch(e) {
  console.log(e);
  return;
}

let source = fs.readFileSync("greeter.json");
let contracts = JSON.parse(source)["contracts"];
let abi = JSON.parse(contracts['greeter.sol:greeter'].abi);
let code = '0x' + contracts['greeter.sol:greeter'].bin;

/*
web3.eth.getAccounts()
  .then(function(accounts) {

  console.log(accounts[0]);
  console.log("");
  
  web3.eth.getBalance(accounts[0])
    .then(function(acctBal) {
      console.log("balance: " + acctBal/1000000000000000000 + " Ether");
      //console.log(web3.fromWei(acctBal,"ether"));
    });
});
*/

/*
// At the end close the account now that we are done
console.log("Locking account : " + web3.eth.accounts[0]);

try {
	web3.personal.lockAccount(web3.eth.accounts[0]);
} catch(e) {
	console.log(e);
	return;
}
*/