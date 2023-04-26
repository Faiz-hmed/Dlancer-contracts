const express = require('express');
const router = express.Router();
const fs=  require('fs')
const Models = require('../../Schema/index.js');
const taskModel = Models.Tasks;
const projectModel = Models.Projects;
const userModel = Models.Users;
const { exec } = require("child_process");
const { default: mongoose, Model } = require('mongoose');
const Matrix = require('ml-matrix');
const natural = require('natural');
const { CountVectorizer } = natural;
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
    );;
  
  // Define project data
  
});

router.get('/collaborators', async (req, res) => {
  const projectid = req.query.projectid;
  console.log(projectid)
  try{
      const collaborators = await projectModel.findById(projectid,{collaborators:1})
      .populate({
      path: 'collaborators',
      model: 'Users',
      select: 'walletID username'
      })
      .exec();
      console.log(collaborators)
      return res.status(200).send(collaborators);
  }catch(e){
      console.error(e.message)
      return res.status(400).send({ success: false, message: 'Project not found!' });
  }
});

router.get('/recommend', async(req,res)=>{
 // Install required libraries
const natural = require('natural');
var proj = await projectModel.find({})
  const users = await userModel.find({});
  proj = proj[1]
  const rec = recommendUsersForProject(users,proj)

// Define similarity function using Jaccard index
function similarity(userSkills, projectSkills) {
  const intersection = userSkills.filter(x => projectSkills.includes(x));
  const union = [...new Set([...userSkills, ...projectSkills])];
  return intersection.length / union.length;
}

// Define recommendation function
function recommendUsersForProject(users,project) {
  const projectSkills = project.requiredSkills;
  const recommendations = [];

  for (const user of users) {
    const userSkills = user.skills;
    const sim = similarity(userSkills, projectSkills);
    recommendations.push({ user, sim });
  }

  recommendations.sort((a, b) => b.sim - a.sim);
  return recommendations.map(x=>{return {name:x.user.username,sim:x.sim}})
  // return recommendations.slice(0, 3).map(x => x.user.name);
}

// Test the recommendation system
// const project = projects[4];
// const recommendedUsers = recommendUsersForProject(project, users);
// console.log(`Recommended users for ${project.name}: ${recommendedUsers.join(', ')}`);
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
        console.log("project del")
        await taskModel.findByIdAndDelete(taskid);
        console.log("task del")
        res.status(200).json({success:true,message:"task successfully deleted"})
  }catch(e){
  console.error(e)
  res.status(500).json({success:false,message:"task could not be deleted"})
  }
});


router.post('/:projectid', async (req, res) => {
  const { employee, contractAddress,name,requiredSkills } = req.body;
  try{

    const projectid = new mongoose.Types.ObjectId(req.params.projectid);
        const newTask = new taskModel({projectID:projectid,taskName:name,freelancer:employee,contractAddress:contractAddress,requiredSkills:requiredSkills});
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