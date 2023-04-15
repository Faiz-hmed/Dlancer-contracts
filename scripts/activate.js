const { ethers,network, getNamedAccounts } = require("hardhat");
const {getLatestAddress} = require('../helpers');

async function main(){


// const TaskContract = await ethers.getContractFactory("TaskContract");
const {deployer,hirer,freelancer} = await getNamedAccounts();
// const employer = ethers.provider.getSigner(hirer);
const reward = ethers.utils.parseEther("0.02"); // set the reward to 1 ETH
const token = await ethers.getContractAt("TaskContract",getLatestAddress(),hirer)
// console.log(token)
console.log(await token.isActivated());
const tok = await token.activateTask({value:reward});
console.log(await token.isActivated());
};
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
