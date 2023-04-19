require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy")
require("dotenv").config()
require("./scripts/testtask")
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.8" ,
  plugins:[
    'hardhat-deploy',
  'hardhat-deploy-ethers'
],
  // defaultNetwork:"hardhat",
  networks:{
    hardhat:{
      chainId:31337
    },
    ganache:{
      url:process.env.GANACHE_RPC,
      accounts:[
        `0x${process.env.ADMIN_PRIVATE_KEY}`,
        `0x${process.env.EMPLOYEE_PRIVATE_KEY}`,
        `0x${process.env.OWNER_PRIVATE_KEY}`
      ],
      chainId:1337
    },
    taskapp:{
      url:process.env.TASKAPP_URL,
      accounts:[
        `0x${process.env.PRIVATE_TASKAPP}`
      ],
      chainId:31337
    },
    goerli:{
      accounts:[process.env.PRIVATE_KEY],
      url:process.env.RPC_URL,
      chainId:5
    },
    // localhost:{
    //   url:"http://127.0.0.1:8545/",
    //   chainId:31337
    // }
  },
  etherscan:{
    apiKey:process.env.ETHERSCAN_API
  },
  namedAccounts:{
    deployer:0,
    freelancer:1,
    hirer:2
  }
};
