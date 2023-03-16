const hre = require("hardhat");
const { ethers } = require('hardhat');
const fs = require('fs');
async function main() {
  const TaskContract = await hre.ethers.getContractFactory("TaskContract");
  const [deployer] = await hre.ethers.getSigners();
const provider = ethers.provider;
const contractAddress = 0x9B06D17ce54B06dF4A644900492036E3AC384517;

const contractName = "TaskContract";
const Contract = await ethers.getContractFactory(contractName);
const abi = Contract.interface.format('json');
fs.writeFileSync(`./artifacts/contracts/${contractName}.json`, abi);
console.log(`ABI saved to ./artifacts/contracts/${contractName}.json`);


const contractInstance = await ethers.getContractAt(abi, contractAddress);
console.log(contractInstance.cancelTask());
  console.log("cancelled");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });