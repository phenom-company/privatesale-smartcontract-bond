var BondToken = artifacts.require("BondToken.sol");
//var config = require("./config.json");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(
    	BondToken,
    	accounts[0],
    	accounts[1],
    	accounts[2]
    	//config.Owner
    );
};