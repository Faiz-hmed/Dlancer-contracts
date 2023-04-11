const fs = require('fs')
const ADDRESS_FILE ='./constants.js';

const getLatestAddress = ()=>{
    const address = JSON.parse(fs.readFileSync(ADDRESS_FILE,'utf-8'))
    return address;
}

module.exports = {getLatestAddress}