// const { connect } = require('@aragon/connect')
// const { Voting } = require('@aragon/connect-thegraph-voting')

// async function main() {
//   // Connect to the DAO
//   const org = await connect('web-dev.dao.eth', 'thegraph')

//   // Get the Voting app
//   const votingApp = await org.app('voting.aragonpm.eth')

//   // Create a new proposal
//   const vote = new Voting(votingApp.address, votingApp.provider)
//   const proposalId = await vote.newVote(['Yes', 'No'], 'Should we do X?')

//   console.log(`Created proposal with ID ${proposalId}`)
// }

// main().catch(console.error)
const Web3 = require('web3');
const { getDefaultProvider } = require('@ethersproject/providers');
const { utils } = require('ethers');
const { DAOFactory } = require('@aragon/toolkit');

// Instantiate web3
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

// Set up an account
const privateKey = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

// Set up DAO factory
const provider = getDefaultProvider('rinkeby'); // Use a different network provider if needed
const daoFactory = await DAOFactory.create({
  web3,
  provider,
});

// Set up DAO parameters
const daoName = 'My DAO';
const daoAvatar = 'https://ipfs.io/ipfs/QmXUUMk6xQ9XgBEivAFhRXV7MzR11NvuJ8WzYrGwPu7kqN';
const daoInitializationParams = {
  name: daoName,
  avatar: daoAvatar,
  tokenName: 'MyToken',
  tokenSymbol: 'MT',
  tokenDecimalPlaces: 18,
};

// Deploy DAO
const dao = await daoFactory.newDAO(account.address, daoInitializationParams);
console.log(`DAO deployed at ${dao.address}`);