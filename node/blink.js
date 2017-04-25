// import ethereum web3 nodejs library
var Web3 = require('web3');

// set your web3 object
var web3 = new Web3();

// import GPIO nodejs library for hardware interaction through GPIO pins on raspberry pi
var Gpio = require('onoff').Gpio;

// set the pin for the LED light
var led = new Gpio(18,'out');

//our interval object for some blinking later...
var iv; 


// set the web3 object local blockchain node
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));


// log some web3 object values to make sure we're all connected
console.log(web3.version.api);
console.log(web3.isConnected());
console.log(web3.version.node);


// test to see if a local coinbase is running ... we'll need this account to interact with a contract.
var coinbase = web3.eth.coinbase;

// if default wallet/account isn't set - this won't have a value.  needed to interact with a contract.
console.log(coinbase);

// let's print the balance of the wallet/account to test coinbase settings
// no worries if this is 0... don't need money to read events!
var balance = web3.eth.getBalance(coinbase);
console.log(balance.toString(10));

//  ABI - Application Binary Interface Definition for the contract that we want to interact with.
//  First set the ABI string ... 
var ABIString = '[{"constant":false,"inputs":[{"name":"x","type":"uint256"}],"name":"set","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"get","outputs":[{"name":"retVal","type":"uint256"}],"payable":false,"type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"name":"data","type":"uint256"}],"name":"ItBlinks","type":"event"}]';

//  Use the string and convert to a JSON object - ABI
var ABI = JSON.parse(ABIString);

// Above was for clarity but this could have been written simply: 
// var ABI = JSON.parse('[{ "constant": false, "inputs": [{ "na...');

// what contract are we going to interact with? (the one below is for Ropsten)
var ContractAddress = '0x50357b4B2af1b3512D3e7C05D9C8c61ef6763149';

// Set the local node default account in order to interact with the contract 
// (can't interact with a contract if it doesn't know 'who' it is interacting with)
web3.eth.defaultAccount = web3.eth.accounts[0];

// now retrieve your contract object with the ABI and contract address values
var blinker = web3.eth.contract(ABI).at(ContractAddress);

console.log(blinker);

// indefinite recursive loop to read the 'ItBlinks' event in the blink contract.
var event = blinker.ItBlinks( {}, function(error, result) {
  if (!error) {
  	// when ItBlinks event is fired, output the value 'data' from the result object and the block number
    var msg = "\n\n*********";
    msg += "Blink!: " + result.args.data + " (block:" + result.blockNumber + ")";
    msg += "*********";
    
    console.log(msg);
    
    //now loop the light blink on for a half second, then off for half second
	iv = setInterval(function(){
	    led.writeSync(led.readSync() === 0 ? 1 : 0)
	}, 500);

    // Stop blinking the light after 10 seconds.
	setTimeout(function() {
		    clearInterval(iv); // Stop blinking
		    led.writeSync(0); //Turn LED off
	}, 10000);


  }
});


