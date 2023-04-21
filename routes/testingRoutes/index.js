const express = require('express');
const router = express.Router();
const fs=  require('fs')
const Models = require('../../Schema/index.js');
const taskModel = Models.Tasks;
const projectModel = Models.Projects;
const { exec } = require("child_process");
const { default: mongoose } = require('mongoose');
// const exec = require("child_process");
const ADDRESS_FILE = 'address.txt';


router.post('/', (req, res) => {
    const { employee,amount,deadline,employer,description,name } = req.body;
    // console.log(req.body)
    const command = `yarn hardhat create --network ganache --employee "${employee}" --amount "${amount}" --deadline "${deadline}" --employer "${employer}" --description "${description}" --name "${name}"`;
    const addressPattern = /TaskContract deployed to: (\w+)/;
    console.log(req.params.projectid)

  

    exec(command,  async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        return res.status(500).send("Error deploying contract");
      }
      const match = stdout.match(addressPattern);
      console.log(stdout)
      if (match) {
        const contractAddress = match[1];
        console.log(`Contract deployed to address: ${contractAddress}`);
        res.status(200).json({success:true,address:contractAddress});

      } else {
        console.error("Failed to extract contract address from stdout.");
        return res.status(500).json({success:false,message:"contract could not be deployed"})
      }
    }
    );

});


router.post('/:projectid', async (req, res) => {
  const { employee, contractAddress } = req.body;
  try{

    const projectid = new mongoose.Types.ObjectId(req.params.projectid);
        const newTask = new taskModel({projectID:projectid,freelancer:employee,contractAddress:contractAddress});
        await newTask.save()
        projectModel.findById(req.params.projectid).then((project)=>{
          project.tasks.push(newTask._id);
          project.save();
        })
        res.status(200).json({success:true,message:"task successfully created"})
  }catch(e){
  console.error(e)
  res.status(500).json({success:false,message:"task could not be created"})
  }
});


router.get('/', async (req, res) => {
      // Return a success response to the client
      res.status(200).send("Task route");
});

module.exports = router;