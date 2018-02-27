const Web3 = require("web3");
const Tx = require('ethereumjs-tx')
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io"));

const account = "10b3a5d8551183a00f429d165d5f480139b93706";
const key = new Buffer('635202ecb8337035982eb7d21269375f67652e51a9ac7f31e98e0006a1745fed', 'hex')

const tokenABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"INITIAL_SUPPLY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];
const tokenAddress = "0xd5c4210e6a53aeddcfaa1a81d621bb648e089340";

const token = new web3.eth.Contract(tokenABI, tokenAddress);

const gasPrice = web3.eth.gasPrice;
const gasPriceHex = web3.utils.toHex(gasPrice);
const gasLimitHex = web3.utils.toHex(3000000);


function sendEm(res) {
	web3.eth.getTransactionCount(account).then(txCount => {
		var tra = {
		    gasPrice: web3.utils.toHex(10e9), // 10 Gwei
		    gasLimit: gasLimitHex,
		    data: token.methods.transfer("10b3a5d8551183a00f429d165d5f480139b93706", 2).encodeABI(),
		    from: account,
		    to: tokenAddress,
		    nonce: txCount
		};

		var tx = new Tx(tra);
		tx.sign(key);

		var stx = tx.serialize();
		web3.eth.sendSignedTransaction('0x' + stx.toString('hex'), (err, hash) => {
		    if (err) { console.log(err); return; }
		    console.log(hash);
		    res.send('<a href="https://ropsten.etherscan.io/tx/' + hash + '">' + hash + '</a>');
		});
	});
}

const express = require('express');
const app = express();

app.get('/', (req, res) => sendEm(res));

app.listen(3000, () => console.log('Name registry REST service is running at http://localhost:3000'));