const express = require('express');
const router = express.Router();
const path = require('path');

const commit = require('../../Integration/commit.js');
const merge = require('../../Integration/merge.js');
const close = require('../../Integration/closePull.js');

const Models = require('../../Schema/index.js');
const IntegrationModel = Models.Integration;
const taskModel = Models.Tasks;
const projectModel = Models.Projects;
const userModel = Models.Users;


// To get all required info by the fetch  script
router.get('/task/:taskid', async (req, res)=>{
    const {taskid} = req.params;

    const task = await taskModel.findOne({_id: taskid});
    console.log(task)
    const project = await projectModel.findOne({_id: task.projectID});
    console.log(task,project)
    await task.populate('testIntegration');
    
    let data = {};
    console.log(task)
    data['dep_installer'] = task.testIntegration.dependencyInstallerCmd;
    data['test_dest_path'] = task.testIntegration.testDestPath;
    data['test_dest_file_name'] = task.testIntegration.testDestFileName;
    data['open_tests'] = task.testIntegration.visibleTests;
    data['hidden_tests'] = task.testIntegration.hiddenTests;
    data['test_runner'] = task.testIntegration.testRunnerCmd;
    
    return res.status(200).json(data);
});

// To complete the task
router.post('/task', async (req, res)=>{
    const {repoName, repoOwner, taskid, prAuthor, prNum, prTitle, prDescription} = req.body;
    
    const task  = await taskModel.findOne({_id: taskid});
    let assignedUserGhUname = await userModel.findOne({walletID: task.freelancer},{ghUserName:1}).exec();
    assignedUserGhUname=assignedUserGhUname.ghUserName;
    if(assignedUserGhUname !== prAuthor){
        console.log(assignedUserGhUname,prAuthor);
        return res.status(401).json({message: "Unauthorized"});
    }
    const tests = task.testIntegration.visibleTests + "\n" + task.testIntegration.hiddenTests;
    const testDestPath = task.testIntegration.testDestPath;
    const testDestFileName = task.testIntegration.testDestFileName;

    try {
        await merge(repoName, repoOwner, prNum, prTitle, prDescription);
    
        const testDest = path.join(testDestPath, testDestFileName);
        await commit(repoName, repoOwner, testDest, tests);
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message: "Internal Server Error"});
    }
    
    // Call completeTask here

    return res.status(200).json({message: "Success"});
});

router.patch('/task/:taskid', async (req, res)=>{
    const {taskid} = req.params;
    const {prNum, repoName, repoOwner} = req.body;

    const success = await close(repoName, repoOwner, prNum);
    if(!success){
        return res.status(500).json({message: "Internal Server Error"});
    }

    return res.status(200).json({message: "Success"});
});

module.exports = router;