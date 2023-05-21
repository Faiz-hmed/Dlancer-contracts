const express = require('express');
require('dotenv').config();
const router = express.Router();
const fs=  require('fs')
const Models = require('../../Schema/index.js');
const taskModel = Models.Tasks;
const projectModel = Models.Projects;
const userModel = Models.Users;
const IntegrationModel = Models.Integration;
const { exec } = require("child_process");
const { default: mongoose, Model } = require('mongoose');
const Matrix = require('ml-matrix');
const natural = require('natural');
const { CountVectorizer } = natural;
// const exec = require("child_process");
const ADDRESS_FILE = 'address.txt';
const { ethers} = require('hardhat');
const { getLatestAddress } = require('../../helpers.js');
const {abi} = require('../../../frontend/constants/index.js')



// Define recommendation function
// function recommendUsersForProject(users,project) {
//   const projectSkills = project.requiredSkills;
//   const recommendations = [];

//   for (const user of users) {
//     const userSkills = user.skills;
//     const sim = similarity(userSkills, projectSkills);
//     recommendations.push({ user, sim });
//   }

//   recommendations.sort((a, b) => b.sim - a.sim);
//   return recommendations.map(x=>{x.user.sim = x.sim; return x.user})
//   // return recommendations.slice(0, 3).map(x => x.user.name);
// }


function similarity(userSkills, projectSkills) {
  const intersection = userSkills.filter(x => projectSkills.includes(x));
  const union = [...new Set([...userSkills, ...projectSkills])];
  return intersection.length / union.length;
}

function recommendUsersForProject(users, project) {
  const projectSkills = project.requiredSkills;
  const recommendations = [];

  for (const user of users) {
    const userSkills = user.skills;
    const sim = similarity(userSkills, projectSkills);
    var ratio;
    if(!user.tasksCompleted.length && !user.tasksAssigned.length)
      ratio = 0.2;
    else
      ratio = user.tasksCompleted.length / user.tasksAssigned.length;
    const score = 0.5 * sim + 0.5 * ratio;
    recommendations.push({ user, sim, ratio, score });
  }

  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.map(x => {
    x.user.sim = x.sim;
    x.user.ratio = x.ratio;
    return x.user;
  });
}


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

router.get('/collaborators', async (req, res) => {                    // Duplicate
  const projectid = req.query.projectid;
  console.log(projectid)
  try{
      const collaborators = await projectModel.findById(projectid,{collaborators:1})
      .populate({
      path: 'collaborators',
      model: 'Users',
      select: 'walletID username ghUserName'
      })
      .exec();
      console.log(collaborators)
      return res.status(200).send(collaborators);
  }catch(e){
      console.error(e.message)
      return res.status(400).send({ success: false, message: 'Project not found!' });
  }
});

router.get('/recommendprojects/:projectid', async(req,res)=>{
 // Install required libraries
  const project = await projectModel.findById(req.params.projectid)
  const users = await userModel.find({});
  const rec = recommendUsersForProject(users,project)
  res.status(200).json(rec)
})

router.post('/complete/:taskid', async(req, res) => {
  try{
    const provider = new ethers.providers.JsonRpcProvider(process.env.GANACHE_RPC);
    const { address } = req.body;
    const contract = new ethers.Contract(address, abi, provider);

    const privateKey = `0x${process.env.ADMIN_PRIVATE_KEY}`;
    const signer = new ethers.Wallet(privateKey, provider);
    const connectedContract = contract.connect(signer);

    //main thing
    const tx = await connectedContract.completeTask();
    const receipt = await provider.waitForTransaction(tx.hash);
    res.json({ receipt });
  }catch(e){
    console.log(e) 
    res.status(500).json({success:false,message:e.message})
  }
});

router.get('/recommendtasks/:taskid', async(req,res)=>{
  // Install required libraries
  // console.log(req.params.taskid)
   const task = await taskModel.findById(req.params.taskid)
   const users = await userModel.find({});
   const rec = recommendUsersForProject(users,task)
   console.log(rec)
   res.status(200).json(rec)
 })

router.delete('/:projectid', async (req, res) => {
  const projectid = req.params.projectid;
  const taskid = req.query.taskid;
  try{  
        await projectModel.findById(projectid).then((project)=>{
            project.tasks = project.tasks.filter((task)=>{return taskid!==task.toString()});
            project.save();
        })
        const task = await taskModel.findById(taskid);
        // console.log(task.freelancer)
        // const user= await userModel.findOne({walletID:task.freelancer})
        // console.log(user,task._id);
        // user.tasksAssigned = user.tasksAssigned.filter((t)=>{return t!=task._id.toString()});
        // console.log(user);
        // await user.save();
        await taskModel.findByIdAndDelete(taskid);
        res.status(200).json({success:true,message:"task successfully deleted"})
  }catch(e){
  console.error(e)
  res.status(500).json({success:false,message:"task could not be deleted"})
  }
});


router.post('/:projectid', async (req, res) => {                            // create tasks
  const { employee, contractAddress,name,requiredSkills, hiddenTests, visibleTests, depInstaller, testDest, testDestFile, runner,auto } = req.body;
  try{
    
    let testintegration;
    if(!auto && (hiddenTests || visibleTests) && depInstaller && testDest && testDestFile && runner){
      testintegration = await IntegrationModel.create({dependencyInstallerCmd: depInstaller, testDestPath: testDest, testDestFileName: testDestFile, testRunnerCmd: runner, hiddenTests: hiddenTests, visibleTests: visibleTests});
    }

    const projectid = new mongoose.Types.ObjectId(req.params.projectid);
        const newTask = new taskModel({projectID:projectid,taskName:name,freelancer:employee,contractAddress:contractAddress,requiredSkills:requiredSkills, testIntegration: testintegration?.id,auto:auto});
        await newTask.save()
        projectModel.findById(req.params.projectid).then(async (project)=>{
          project.tasks.push(newTask._id);
          userModel.findOne({walletID:employee.toLowerCase()}).then((user)=>{
            user.tasksAssigned.push(newTask._id);
            user.save();
            project.save();
          })
        })
        res.status(200).json({success:true,message:"task successfully created"})
  }catch(e){
  console.error(e)
  res.status(500).json({success:false,message:"task could not be created"})
  }
});

router.get('/', async (req, res) => {
      // Return a success response to the client
      res.status(200).json({title:"Task title",description:"task description",employee:"employee id", reward:100, deadline:2});
});

module.exports = router;