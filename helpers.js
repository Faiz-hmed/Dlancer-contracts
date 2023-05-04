const fs = require('fs')
const ADDRESS_FILE ='./constants.js';
const BUSD_ADDRESS_FILE = './busd_address.js';
const getLatestAddress = ()=>{
    const address = JSON.parse(fs.readFileSync(ADDRESS_FILE,'utf-8'))
    return address;
}
const getBusdAddress = ()=>{
    const address = JSON.parse(fs.readFileSync(BUSD_ADDRESS_FILE,'utf-8'))
    return address;
}
module.exports = {getLatestAddress,getBusdAddress}