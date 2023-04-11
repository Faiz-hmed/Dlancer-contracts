const { ethers,network, getNamedAccounts } = require("hardhat");
const {getLatestAddress} = require('../helpers');

async function main(){


// const TaskContract = await ethers.getContractFactory("TaskContract");
const {deployer,hirer,freelancer} = await getNamedAccounts();
// const employer = ethers.provider.getSigner(hirer);
const reward = ethers.utils.parseEther("1"); // set the reward to 1 ETH
const amount = ethers.utils.parseEther("1"); // set the reward to 1 ETH
const token = await ethers.getContractAt("TaskContract",getLatestAddress(),freelancer)
console.log(await token.isCompleted());
const tok = await token.completeTask();
console.log(await token.isCompleted());
// const tok = await token.activateTask(amount,{value:amount});
// const tok = await token.isCompleted();
console.log(tok);
};
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
