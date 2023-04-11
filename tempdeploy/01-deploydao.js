
const { ethers } = require("hardhat");
const { getNamedAccounts } = require("hardhat");
const { networks } = require("../hardhat.config");
module.exports = async ({ deployments }) => {
  const {deploy, log} = deployments
  
  const {deployer} = await getNamedAccounts();
  const employee = "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"; // replace with employee address
  const reward = ethers.utils.parseEther("1"); // replace with reward amount
  const deadline = Math.floor(Date.now() / 1000) + 86400; // set deadline to 24 hours from now
  const taskDescription = "Example task description";
  // const daoAddress = "0xe55f754b332f03e05862e1514817e893807d0218"
  const taskContract = await deploy("WorkValidation", {
    from: deployer,
    args: [
      employee,
      reward,
      deadline,
      taskDescription,
    ],
    chainId:31337,
    value:reward,
    log: true,
  });
  const token = await ethers.getContract("WorkValidation")
  // await token.transferOwnership("0xFABB0ac9d68B0B445fB7357272Ff202C5651694a");
  //  await token.transferOwnership(0x89E2Da7cAC0360e7796722bA47b40c46A9CFEF39);
  console.log(token.address)

  // const t = await token.activateTask(amount,{value:amount});
  // console.log(t);
};


// const { ethers } = require("hardhat");

// async function main() {


//   // deploy TaskContract
//   const TaskContract = await ethers.getContractFactory("TaskContract");
//   const taskContract = await TaskContract.deploy(employee, reward, deadline, taskDescription);
//   await taskContract.deployed();
//   console.log("TaskContract deployed to:", taskContract.address);

//   // set DAO address
//   const daoAddress = "0x1234567890123456789012345678901234567890"; // replace with DAO address
//   await taskContract.setDAO(daoAddress);
//   console.log("DAO address set to:", daoAddress);
// }

// main()
//   .then(() => process.exit(0))
//   .catch(error => {
//     console.error(error);
//     process.exit(1);
//   });


