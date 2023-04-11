const { network, getNamedAccounts } = require("hardhat");
const hre = require("hardhat");
const fs = require('fs')
const ADDRESS_FILE ='./constants.js';
const {getLatestAddress} = require('../helpers')


async function main() {
 const {deployer,hirer,freelancer} = await getNamedAccounts();
  const TaskContract = await hre.ethers.getContractFactory("TaskContract");
  const amount = ethers.utils.parseEther("0.02"); // send 1 ETH with the transaction
  const taskContract = await TaskContract.deploy(
    freelancer,
    amount,
    Math.floor(Date.now() / 1000) + 3600,
    hirer,
    "A cool task"
  );
  await taskContract.deployed();
  console.log("TaskContract deployed to:", taskContract.address);
  fs.writeFileSync(ADDRESS_FILE,JSON.stringify(taskContract.address))
  
  const task = await ethers.getContractAt("TaskContract",getLatestAddress(),hirer)
//   const activated = await task.activateTask(amount,{value:amount});
  const activated = await task.isActivated();

  console.log(activated);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });