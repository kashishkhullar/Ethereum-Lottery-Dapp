const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const { interface, bytecode } = require("./compile");

// hd wallet provider connects to the node
// and also signs the transactions
const provider = new HDWalletProvider(
  "MNEMONIC_STRING",
  "https://rinkeby.infura.io/v3/ef55ecf344134dc3b7af64352db78068"
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log(`deploying from account ${accounts[0]}`);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: "0x" + bytecode })
    .send({ from: accounts[0], gas: 1000000 });

  console.log(interface);
  console.log(`Contract deployed to ${result.options.address}`);
};

deploy();
