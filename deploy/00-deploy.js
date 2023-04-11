
const { ethers } = require("hardhat");
const { getNamedAccounts } = require("hardhat");
const { networks } = require("../hardhat.config");
module.exports = async ({ deployments }) => {
  const {deploy, log} = deployments
  const network = await ethers.provider.getNetwork();
  const employee = network.name=="taskapp"?"0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec":"0x666aBFE4f39972E794E325CC84Ea241F8bC3C283";
  const {deployer,freelancer,hirer} = await getNamedAccounts();
  const amount = ethers.utils.parseEther("0.05"); // set the reward to 1 ETH
  const taskContract = await deploy("TaskContract", {
    from: deployer,
    args: [
      freelancer,
      amount,
      Math.floor(Date.now() / 1000) + 3600,
      hirer
    ],
    chainId:1337,
    value:amount,
    log: true,
  });
  const token = await ethers.getContract("TaskContract")
  // const t = await token.activateTask(amount,{value:amount});
  console.log(taskContract);
};


