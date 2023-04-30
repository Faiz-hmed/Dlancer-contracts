const { ethers,network, getNamedAccounts } = require("hardhat");
const {getLatestAddress} = require('../helpers');

async function main(){


const {deployer,hirer,freelancer} = await getNamedAccounts();

const busdContract = await ethers.getContractFactory("MockBUSD");
const busdToken = await busdContract.attach("0x7846b8505127eF5701b531e95420449A52FD1390");
// console.log(busdToken)
// Approve the TaskContract to spend BUSD tokens on your behalf

await busdToken.mint(deployer, ethers.utils.parseUnits("10000"));
await busdToken.mint(freelancer,ethers.utils.parseUnits("10000"));
await busdToken.mint(hirer, ethers.utils.parseUnits("10000"));

const dep = await hre.ethers.getSigners();
const amount = ethers.utils.parseUnits("100"); // 100 BUSD tokens in 18 decimal places
const taskContractAddr = getLatestAddress();
await busdToken.connect(dep[2]).approve(taskContractAddr, amount);

// const hr = await busdToken.approve(taskContractAddr, amount);
// const act = await busdToken.allowance(hirer, taskContractAddr);
// const act = await busdToken.balanceOf(hirer);
// console.log(ethers.utils.formatUnits(act));
// const hr = await busdToken.approve(getLatestAddress(),amount);
// const balance = await busdToken.balanceOf(hirer);
// console.log(ethers.utils.formatUnits(balance));
// console.log(hr)

// Call the activateTask function with BUSD token transfer
// const taskContract = await ethers.getContractFactory("TaskContract");

const task = await ethers.getContractAt("TaskContract",getLatestAddress(),hirer)

// const task = await taskContract.attach(getLatestAddress());
// const details = await task.getValues();
// console.log(details) 
// console.log(task)
const done = await task.activateTask();
console.log(done)

// const act = await busdToken.allowance(hirer,getLatestAddress());
// const act = await task.viewReward();

// console.log(ethers.utils.formatEther(await busdToken.balanceOf(getLatestAddress())));

// const done = await task.activateTask();

// console.log(ethers.utils.formatEther(await busdToken.balanceOf(hirer)));
// console.log(ethers.utils.formatEther(await task.getBalance()));
};
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


