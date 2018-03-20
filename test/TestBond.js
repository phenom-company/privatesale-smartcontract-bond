var BondToken = artifacts.require("BondToken.sol");

/* 
====================================================================================================
BondToken tests
====================================================================================================
*/

contract('BondToken', function(accounts) {
    function randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1)
        rand = Math.round(rand);
        return rand;
    };
    var BondTokenContract; 
    // Outside addresses
    var owner = accounts[0];
    var controller = accounts[1];
    var airDropManager = accounts[2];
    var notManager = accounts[3];
    var firstInvestor = accounts[4];
    var secondInvestor = accounts[5];
    var firstAirDrop = accounts[6];
    var secondAirDrop = accounts[7];
    var notInvestor = accounts[8];

    it('shouldn\'t allow mint tokens for someone except owner', function() {
        var random_int = randomInteger(100000, 1000000);
        return BondToken.deployed()
        .then(function(instance) {
                var Contract = instance;
                BondTokenContract = Contract;
                return BondTokenContract.mintTokens(
                    firstInvestor,
                    parseFloat(random_int + 'E18'),
                    {
                    from: notManager
                    }
                );
        })
        .then(function() {
            assert(false, 'tokens were minted');
        })
        .catch(function(e) {
            assert.equal(e.message,'VM Exception while processing transaction: revert', 'wrong error message');
        })
    });

    it('shouldn\'t allow to invoke buyForInvestor function for someone except controller', function() {
        var random_int = randomInteger(100000, 1000000);
        var txHash = "someHash";
        return BondTokenContract.buyForInvestor(
            firstInvestor,
            parseFloat(random_int + 'E18'),
            txHash,
            {
            from: notManager
            }
        )
        .then(function() {
            assert(false, 'tokens were minted');
        })
        .catch(function(e) {
            assert.equal(e.message,'VM Exception while processing transaction: revert', 'wrong error message');
        })
    });


    it('shouldn\'t allow to invoke batchDrop function for someone except air drop manager', function() {
        var random_int = randomInteger(100000, 1000000);
        return BondTokenContract.batchDrop(
            [firstInvestor],
            [parseFloat(random_int + 'E18')],
            {
            from: notManager
            }
        )
        .then(function() {
            assert(false, 'tokens were minted');
        })
        .catch(function(e) {
            assert.equal(e.message,'VM Exception while processing transaction: revert', 'wrong error message');
        })
    });
    
    it('should mint tokens correctly', async function() {
        var random_int = randomInteger(1000, 100000);
        await BondTokenContract.mintTokens(
            firstInvestor,
            parseFloat(random_int + 'E18'),
            {
            from: owner
            }
        );
        var balance = await BondTokenContract.balanceOf.call(firstInvestor);
        assert.equal(parseFloat(balance.toString()), parseFloat(random_int + 'E18'), 'tokens wasn\'t minted correctly');

    });

    it('should mint tokens throw buyForInvestor correctly', async function() {
        var random_int = randomInteger(1000, 100000);
        var txHash = "someHash";
        await BondTokenContract.buyForInvestor(
            secondInvestor,
            parseFloat(random_int + 'E18'),
            txHash,
            {
            from: controller
            }
        );
        var balance = await BondTokenContract.balanceOf.call(secondInvestor);
        assert.equal(parseFloat(balance.toString()), parseFloat(random_int + 'E18'), 'tokens wasn\'t minted correctly');

    });


    it('should perform air drop correctly', async function() {
        var random_int = randomInteger(1000, 100000);
        await BondTokenContract.batchDrop(
            [firstAirDrop, secondAirDrop],
            [parseFloat(random_int + 'E18'), parseFloat(random_int + 'E18')],
            {
            from: airDropManager
            }
        );
        var balanceFirst = await BondTokenContract.balanceOf.call(firstAirDrop);
        var balanceSecond = await BondTokenContract.balanceOf.call(secondAirDrop);
        assert.equal(parseFloat(balanceFirst.toString()), parseFloat(random_int + 'E18'), 'tokens wasn\'t droped correctly');
        assert.equal(parseFloat(balanceSecond.toString()), parseFloat(random_int + 'E18'), 'tokens wasn\'t droped correctly');
    });

    it('shouldn\'t allow send ether to contract address', function() {
        var etherAmout = randomInteger(1, 10);
        BondTokenContract.sendTransaction({
            from: notInvestor,
            value: web3.toWei(etherAmout, 'ether')
        })
        .then(function() {
            assert(false, 'ether was sended');
        })
        .catch(function(e) {
        assert.equal(e.message,'VM Exception while processing transaction: revert', 'wrong error message');
        })
    });

    it('shouldn\'t allow tokens transfers when tokens are frozen', function() {
        return BondTokenContract.transfer(
                firstInvestor,
                1000, 
                {
                    from: notInvestor
                }
        )
        .then(function() {
            assert(false, 'tokens were transfered');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');            
        });
    });


    it('shouldn\'t allow to unfreeze tokens for someone except owner', function() {
        return BondTokenContract.unfreeze(
            {
                from: notManager
            }
        )
        .then(function() {
            assert(false, 'tokens were unfreezed');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');            
        });
    });


    it('should unfreeze tokens', function() {
        return BondTokenContract.unfreeze(
            {
                from: owner
            }
        )
        .then(function(tx) {
            assert(tx.receipt.status == 1, 'tokens weren\'t unfreezed');
        })
    });

  it('should allow to transfer tokens when tokens arn\'t fronzen', async function() {
        var balanceBefore = await BondTokenContract.balanceOf.call(notInvestor);
        await BondTokenContract.transfer(
                notInvestor,
                1000, 
                {
                    from: firstInvestor
                }
        );
        var balanceAfter = await BondTokenContract.balanceOf.call(notInvestor);
        assert.equal(balanceAfter.toNumber() - balanceBefore.toNumber(), 1000, 'tokens weren\'t transfered');
    });

    it('shouldn\'t allow to freeze tokens for someone except owner', function() {
        return BondTokenContract.freeze(
            {
                from: notManager
            }
        )
        .then(function() {
            assert(false, 'tokens were unfreezed');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');            
        });
    });

    it('should freeze tokens', function() {
        return BondTokenContract.freeze(
            {
                from: owner
            }
        )
        .then(function(tx) {
            assert(tx.receipt.status == 1, 'tokens weren\'t unfreezed');
        })
    });

    it('shouldn\'t allow tokens transfers when tokens are frozen', function() {
        return BondTokenContract.transfer(
                firstInvestor,
                1000, 
                {
                    from: notInvestor
                }
        )
        .then(function() {
            assert(false, 'tokens were transfered');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');            
        });
    });


    it('shouldn\'t allow to burn tokens for someone except owner', function() {
        return BondTokenContract.balanceOf.call(secondInvestor)
        then(function(balance) {
            return BondTokenContract.burnTokens(
                secondInvestor,
                parseFloat(balance),
                {
                from: notManager
                }
            )
        })
        .then(function() {
            assert(false, 'tokens were bunt');
        })
        .catch(function(e) {
            assert(e.message == 'VM Exception while processing transaction: revert', 'wrong err message');            
        });
    });

    it('should burn tokens correctly', async function() {     
        var balanceBefore = await BondTokenContract.balanceOf.call(secondInvestor);
        await BondTokenContract.burnTokens(
            secondInvestor,
            parseFloat(balanceBefore),
            {
            from: owner
            }
        );
        balance = await BondTokenContract.balanceOf.call(secondInvestor);
        assert.equal(parseFloat(balance.toString()), 0, 'tokens weren\'t bunt');

    });

});