require("@nomicfoundation/hardhat-toolbox");

const fs = require('fs')
const ADDRESS_FILE ='./constants.js';
const ADDRESSES = "../frontend/constants/addresses.json";
const ABI_FILE = "../frontend/constants/abi.json";
const {getLatestAddress} = require('../helpers')

task("create", "creates a task")
  .addParam("employee","employee wallet address")
  .addParam("amount", "reward amount in USD")
  .addParam("deadline", "deadline") 
  .addParam("employer", "employer wallet address")
  .addParam("description", "task description")
  .addParam("name", "task name")
  .setAction(async (args, hre) => {
    const TaskContract = await hre.ethers.getContractFactory("TaskContract");
    const amount = ethers.utils.parseUnits("100")
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const name = args.name;
    const description=args.description || "It is a cool task";
    console.log(`employee:, ${args.employee}, amount:, ${args.amount}, deadline:, ${args.deadline}, employer:, ${args.employer}, taskDescription:, ${args.description}, taskname: ${args.name}`);
    const {deployer,freelancer,hirer} = await hre.getNamedAccounts();

    // const taskContract = await TaskContract.deploy(
    //     freelancer, // employee wallet address
    //     amount, // reward amount in USD
    //     deadline, //deadline 
    //     hirer, //employer wallet address
            // name,//name of the task
    //     description, // task description
    //     "0x21E0F5d54E45CE43f465a19AA3668F03be118CfC" // BUSD contract address
    //   );
    //   await taskContract.deployed();
    console.log("TaskContract deployed to:", '0xBA0f437Dc55Bb2a56830d151F4Fe25bE03fcc778');

      // console.log("TaskContract deployed to:", taskContract.address);
    // fs.writeFileSync(ADDRESS_FILE,JSON.stringify("0xB35B57f55d8188460AC223E430Af3E463a691b4e"))
      
    //   const task = await ethers.getContractAt("TaskContract",getLatestAddress(),hirer)
      
    //   const activated = await task.isActivated();
    //   await updateContractAdresses(taskContract.address);
    //   await updateAbi(TaskContract.interface.format(ethers.utils.FormatTypes.json));
    //   console.log(activated);
    });


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