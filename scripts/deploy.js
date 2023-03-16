const hre = require("hardhat");

async function main() {
  const TaskContract = await hre.ethers.getContractFactory("TaskContract");
  // const [deployer] = await hre.ethers.getSigners();
  const reward = ethers.utils.parseEther("5"); // set the reward to 1 ETH
  const amount = ethers.utils.parseEther("5"); // set the reward to 1 ETH
  // const TaskContract = await hre.ethers.getContractFactory("fundme");

  // const taskContract = await TaskContract.deploy();
  // const taskContract = await TaskContract.deploy("0x89E2Da7cAC0360e7796722bA47b40c46A9CFEF39", 10, Math.floor(Date.now() / 1000) + 500, "Sample task");
  const employee = ethers.provider.getSigner("0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec");
  const owner = ethers.provider.getSigner("0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097");
  const taskContract = await TaskContract.deploy(
    "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
    reward, 
    Math.floor(Date.now() / 1000) + 3600, // set the deadline to 1 hour from now
    "Sample task description"
     // send the specified amount of ether
  );
  await taskContract.deployed();
  console.log("TaskContract deployed to:", taskContract.address);
  const activated  = await taskContract.connect(owner).activateTask(reward,{ value: amount});
  await taskContract.deployTransaction.wait(1);
  console.log(activated);
  // const completetrans = await taskContract.connect(employee).completeTask();
  // console.log(completetrans);
  // const canceltrans = await taskContract.cancelTask();
  // console.log(completetrans);


  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });