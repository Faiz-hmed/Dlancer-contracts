const { network, getNamedAccounts } = require("hardhat");
const hre = require("hardhat");
const fs = require('fs')
const ADDRESS_FILE ='./constants.js';
const ADDRESSES = "../frontend/constants/addresses.json";
const ABI_FILE = "../frontend/constants/abi.json";
const {getLatestAddress} = require('../helpers')


async function main() {
 const {deployer,hirer,freelancer} = await getNamedAccounts();
 const TaskContract = await hre.ethers.getContractFactory("TaskContract");

  // const amount = ethers.utils.parseEther("0.02"); // send 1 ETH with the transaction
  const amount = ethers.utils.parseUnits("100")
  const employee = freelancer
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  const taskname = "Todo"
  const task_description="It is a cool task";

  const taskContract = await TaskContract.deploy(
    freelancer, // employee wallet address
    amount, // reward amount in USD
    deadline, //deadline 
    hirer, //employer wallet address
    taskname,
    task_description, // task description
    "0x21E0F5d54E45CE43f465a19AA3668F03be118CfC" // BUSD contract address
  );
  await taskContract.deployed();
  console.log("TaskContract deployed to:", taskContract.address);
  fs.writeFileSync(ADDRESS_FILE,JSON.stringify(taskContract.address))
  
  const task = await ethers.getContractAt("TaskContract",getLatestAddress(),hirer)
  
  const activated = await task.isActivated();
  await updateContractAdresses(taskContract.address);
  await updateAbi(TaskContract.interface.format(ethers.utils.FormatTypes.json));
  console.log(activated);
}



async function updateAbi(abi){
  // const contract  = await ethers.getContract("TaskContract");
  // fs.writeFileSync(ABI_FILE, contract.interface.format(ethers.utils.FormatTypes.json));
  fs.writeFileSync(ABI_FILE, abi);
  console.log("done");
}

async function updateContractAdresses(address){
  const addresses = JSON.parse(fs.readFileSync(ADDRESSES,'utf-8'))
  console.log(addresses)
  const chainId = network.config.chainId.toString();
  if(chainId in addresses){
      if(!addresses[chainId].includes(address))
          addresses[chainId].push(address)
  }else  {
      addresses[chainId] = [address]
      console.log(address);
  }
    fs.writeFileSync(ADDRESSES,JSON.stringify(addresses))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });