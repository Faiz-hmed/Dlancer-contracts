const { ethers,network, getNamedAccounts } = require("hardhat");
const {getLatestAddress, getBusdAddress} = require('../helpers');

async function main(){


// const TaskContract = await ethers.getContractFactory("TaskContract");
const {deployer,hirer,freelancer} = await getNamedAccounts();
const busdContract = await ethers.getContractFactory("MockBUSD");
const busdToken = await busdContract.attach(getBusdAddress());
// const employer = ethers.provider.getSigner(hirer);
const reward = ethers.utils.parseEther("1"); // set the reward to 1 ETH
const amount = ethers.utils.parseEther("1"); // set the reward to 1 ETH
const token = await ethers.getContractAt("TaskContract",getLatestAddress(),freelancer)
console.log(ethers.utils.formatEther(await busdToken.balanceOf(freelancer)));
const tok = await token.completeTask();
console.log(ethers.utils.formatEther(await busdToken.balanceOf(freelancer)));
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
