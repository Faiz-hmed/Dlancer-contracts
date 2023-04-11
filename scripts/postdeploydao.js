const { ethers,network } = require("hardhat");
async function main(){

// const TaskContract = await ethers.getContractFactory("TaskContract");
const reward = ethers.utils.parseEther("5"); // set the reward to 1 ETH
const amount = ethers.utils.parseEther("5"); // set the reward to 1 ETH
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // replace with the actual contract address
const token = await ethers.getContractAt("WorkValidation", contractAddress);
// const setdao = await token.setDAO("0xe55f754b332f03e05862e1514817e893807d0218");
const setdao = await token.setDAO("0xB84C92EC2AF24b0841Ad8FCB5D0eCC43B95e5569");

// const tok= await ethers.getContract("DaoTaskContract")

// console.log(tol);
// console.log(setdao)
const tol = await token.activateTask(amount,"this is the criteria",{value:amount});
console.log("activated");
// const tok = await token.getnative();
const tok = await token.completeTask("print('hello world')");
console.log(tok);
};


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


  