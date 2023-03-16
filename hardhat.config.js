require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.8" ,
  // defaultNetwork:"hardhat",
  networks:{
    hardhat:{
      chainId:1337
    },
    taskapp:{
      url:process.env.TASKAPP_URL,
      accounts:[
        `0x${process.env.PRIVATE_TASKAPP}`
      ]
    }
    // goerli:{
    //   accounts:[process.env.PRIVATE_KEY],
    //   url:process.env.RPC_URL,
    //   chainId:5
    // },
    // localhost:{
    //   url:"http://127.0.0.1:8545/",
    //   chainId:31337
    // }
  },
  etherscan:{
    apiKey:process.env.ETHERSCAN_API
  }
};
