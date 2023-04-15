const { ethers,network, getNamedAccounts } = require("hardhat");
const {getLatestAddress} = require('../helpers');

async function main(){

const {deployer,hirer,freelancer} = await getNamedAccounts();
const busdContract = await ethers.getContractFactory("MockBUSD");
const busdToken = await busdContract.attach("0x21E0F5d54E45CE43f465a19AA3668F03be118CfC");
// await busdToken.mint(deployer, ethers.utils.parseUnits("10000"));
// await busdToken.mint(freelancer,ethers.utils.parseUnits("10000"));
// await busdToken.mint(hirer, ethers.utils.parseUnits("10000"));
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

console.log(signer)
const dep = await hre.ethers.getSigners();
const amount = ethers.utils.parseUnits("1000"); // 1000 BUSD tokens in 18 decimal places
const taskContractAddr = getLatestAddress();
// await busdToken.connect(dep[2]).approve(taskContractAddr, amount);
// const task = await ethers.getContractAt("TaskContract",getLatestAddress(),hirer)

// const done = await task.activateTask();

};
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


