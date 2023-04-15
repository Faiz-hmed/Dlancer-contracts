const {ethers, network} = require('hardhat')
const fs = require('fs')
const ADDRESS_FILE = "../frontend/constants/addresses.json";
const ABI_FILE = "../frontend/constants/abi.json";
module.exports = async function(){
    if(process.env.UPDATE_FRONTEND){
        console.log("updating frontend");
        await updateContractAdresses();
        await updateAbi();
    }
}

async function updateAbi(){
    const contract  = await ethers.getContract("TaskContract");
    fs.writeFileSync(ABI_FILE, contract.interface.format(ethers.utils.FormatTypes.json));
    console.log("done");
}

async function updateContractAdresses(){
    const contract = await ethers.getContract("TaskContract")
    const addresses = JSON.parse(fs.readFileSync(ADDRESS_FILE,'utf-8'))
    console.log(addresses)
    const chainId = network.config.chainId.toString();
    if(chainId in addresses){
        if(!addresses[chainId].includes(contract.address))
            addresses[chainId].push(contract.address)
    }else  
        addresses[chainId] = [contract.address]
        fs.writeFileSync(ADDRESS_FILE,JSON.stringify(addresses))
}
module.exports.tags = ["all","frontend"]