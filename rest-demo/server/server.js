#!/usr/bin/env node
const Web3 = require("web3");
const Tx = require('ethereumjs-tx')
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/tplchecker"));

const tokenABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"INITIAL_SUPPLY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];
const tokenAddress = "0x9f6045fbd364f7729b699809fb2aea350e2067a6";

const token = new web3.eth.Contract(tokenABI, tokenAddress);

const registryABI = [{"constant":false,"inputs":[{"name":"to","type":"string"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"name","type":"string"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"name","type":"string"}],"name":"claimName","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getName","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"UNCLAIMED","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"name","type":"string"}],"name":"getAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"nameOf","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
const registryAddress = "0x3877641ec0efcff768df6856ca6c8195ade22f86";

const registry = new web3.eth.Contract(registryABI, registryAddress);

const gasPrice = web3.eth.gasPrice;
const gasPriceHex = web3.utils.toHex(gasPrice);
const gasLimitHex = web3.utils.toHex(3000000);

const managerAddress = "10b3a5d8551183a00f429d165d5f480139b93706";
const managerKey = new Buffer('635202ecb8337035982eb7d21269375f67652e51a9ac7f31e98e0006a1745fed', 'hex');
const managerAccount = {address: managerAddress, key: managerKey};

function replyWhenTxIsReady(res, account, txData, to) {
	console.log(account);
	web3.eth.getTransactionCount(account.address).then(txCount => {
		var tra = {
		    gasPrice: web3.utils.toHex(10e9), // 10 Gwei
		    gasLimit: gasLimitHex,
		    data: txData,
		    from: account.address,
		    to: to,
		    nonce: txCount
		};

		var tx = new Tx(tra);
		key = new Buffer(account.key, 'hex');
		tx.sign(key);

		var stx = tx.serialize();
		web3.eth.sendSignedTransaction('0x' + stx.toString('hex'))
			.on('transactionHash', console.log)
			.on('receipt', (receipt) => res.send(receipt))
			.on('error', (error) => res.send(error));
	});
}

function addressAndKey(req) {
	return {
		address: req.body.address,
		key: req.body.key
	};
}

/*
  Sends some free tokens FOR TESTING PURPOSES
*/
function getTokens(res, address, value) {
	txData = token.methods.transfer(address, value).encodeABI();
	replyWhenTxIsReady(res, managerAccount, txData, tokenAddress);
}

function approveRegistry(res, account, value) {
	txData = token.methods.approve(registryAddress, value).encodeABI();
	replyWhenTxIsReady(res, account, txData, tokenAddress);
}

function sendYourself(res, account, value) {
	txData = token.methods.transfer("10b3a5d8551183a00f429d165d5f480139b93706", value).encodeABI();
	replyWhenTxIsReady(res, account, txData, tokenAddress);
}

function claimName(res, account, name) {
	txData = registry.methods.claimName(name).encodeABI();
	replyWhenTxIsReady(res, account, txData, registryAddress);
}

function transfer(res, account, name, value) {
	txData = registry.methods.transfer(name, value).encodeABI();
	replyWhenTxIsReady(res, account, txData, registryAddress);
}

function getName(res, address) {
	registry.methods.getName(address).call()
		.then((name) => res.send(name));
}

function getAddr(res, name) {
	registry.methods.getAddr(name).call()
		.then((addr) => res.send(addr));
}

function balanceOf(res, name) {
	registry.methods.balanceOf(name).call()
		.then((addr) => res.send(addr));
}

const express = require('express');
const app = express();
app.use(express.urlencoded());

app.post('/getTokens/:address/:value',    (req, res) => getTokens(res, req.params.address, req.params.value));
app.post('/approveRegistry/:value',    (req, res) => approveRegistry(res, addressAndKey(req), req.params.value));
app.post('/sendYourself/:value', (req, res) => sendYourself(res, addressAndKey(req), req.params.value));
app.post('/claimName/:name',     (req, res) => claimName(res, addressAndKey(req), req.params.name));
app.post('/transfer/:name/:value',     (req, res) => transfer(res, addressAndKey(req), req.params.name, req.params.value));
app.post('/getName/:address',    (req, res) => getName(res, req.params.address));
app.post('/getAddr/:name',       (req, res) => getAddr(res, req.params.name));
app.post('/balanceOf/:name',     (req, res) => balanceOf(res, req.params.name));

app.get('/getTokens/:address/:value',    (req, res) => getTokens(res, req.params.address, req.params.value));
app.get('/approveRegistry/:value',    (req, res) => approveRegistry(res, addressAndKey(req), req.params.value));
app.get('/sendYourself/:value', (req, res) => sendYourself(res, addressAndKey(req), req.params.value));
app.get('/claimName/:name',     (req, res) => claimName(res, addressAndKey(req), req.params.name));
app.get('/transfer/:name/:value',     (req, res) => transfer(res, addressAndKey(req), req.params.name, req.params.value));
app.get('/getName/:address',    (req, res) => getName(res, req.params.address));
app.get('/getAddr/:name',       (req, res) => getAddr(res, req.params.name));
app.get('/balanceOf/:name',     (req, res) => balanceOf(res, req.params.name));

app.listen(3000, () => console.log('Name registry REST service is running at http://localhost:3000'));
