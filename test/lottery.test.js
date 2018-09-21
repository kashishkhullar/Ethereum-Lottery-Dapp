const assert = require('assert'); // assertion library from node
const ganache = require('ganache-cli'); // creates a local test network
const Web3 = require('web3'); // to connect to network
const {interface,bytecode} = require('../compile');
// require('events').EventEmitter.defaultMaxListeners = 20; 

// provider is a driver that a network provides, used to access the network
const web3 = new Web3(ganache.provider());
let accounts;
let lottery;

beforeEach( async ()=>{
    accounts = await web3.eth.getAccounts();
    // console.log(accounts);
    // lottery represents what exists on the blockchain and
    // can be used to call functions on it
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0],gas: '1000000' });
        // console.log(lottery);
});

describe("Lottery",()=>{

    it('deploys a contract',()=>{
        // the assert.ok() method tests if a given expression is true or not.
        // so if address exists then it was deployed otherwise not
        assert.ok(lottery.options.address);
    });

    it('allow one account to enter', async ()=>{

        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02',"ether") 
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0],players[0]);
        assert.equal(1,players.length);
    });
    it('allow multiple account to enter', async ()=>{

        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02',"ether") 
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02',"ether") 
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02',"ether") 
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.equal(accounts[0],players[0]);
        assert.equal(accounts[1],players[1]);
        assert.equal(accounts[2],players[2]);
        assert.equal(3,players.length);
    });

    it('requires a minimum amount of ether to enter',async ()=>{
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            assert(false);
        } catch (err) {
            assert(err);
        }

    });

    it('only manager can call',async()=>{
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02',"ether") 
        });
        try{
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch(err){
            // console.log(err);
            assert(err);
        }
            
    });

    it('sends money to the winner and resets the players array',async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2',"ether") 
        });

        let initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        let finalBalance = await web3.eth.getBalance(accounts[0]);

        let difference = finalBalance - initialBalance;
        // console.log(difference);
        assert(difference > web3.utils.toWei('1.8','ether'));
    });


}); 