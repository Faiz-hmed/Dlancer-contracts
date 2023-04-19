const express = require('express');
const router = express.Router();
const fs=  require('fs')
const { exec } = require("child_process");
// const exec = require("child_process");
const ADDRESS_FILE = 'address.txt';




router.post('/', (req, res) => {
    const { employee,amount,deadline,employer,description } = req.body;

    // Construct the Hardhat command to execute the script
    // const command = `yarn hardhat run scripts/testask.js --network ganache ${parameter1} ${parameter2}`;
    const command = `yarn hardhat create --network ganache --employee "${employee}" --amount "${amount}" --deadline "${deadline}" --employer "${employer}" --description "${description}"`;

    req.setTimeout(60000);
    // Execute the command
 
    exec(command,  (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        return res.status(500).send("Error deploying contract");
      }
      // Return a success response to the client
      res.status(200).send("Contract deployed successfully");
      console.log(stdout)
    });

});


router.get('/', async (req, res) => {
 
  
      // Return a success response to the client
      res.status(200).send("Contract deployed successfully");
});

module.exports = router;