const { network, getNamedAccounts } = require("hardhat");
const hre = require("hardhat");
const fs = require('fs')
const ADDRESS_FILE ='./constants.js';
const BUSD_ADDRESS_FILE = './busd_address.js'
const {getLatestAddress} = require('../helpers')


async function main() {
 const TaskContract = await hre.ethers.getContractFactory("MockBUSD");

  const taskContract = await TaskContract.deploy();
  await taskContract.deployed();
  console.log("BUSD deployed to:", taskContract.address);
  fs.writeFileSync(BUSD_ADDRESS_FILE,JSON.stringify(taskContract.address))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });