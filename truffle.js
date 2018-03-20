module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 1900000
    },
  	live: {
  	  host: "localhost",
      port: 8535,
      network_id: "1", 
      gas: 1400000,
      gasPrice: 8000000000,
      from: "0x7e49cC14e77884CeF1311D9c3F9403f3084934ED"	
  	}
  }
};
