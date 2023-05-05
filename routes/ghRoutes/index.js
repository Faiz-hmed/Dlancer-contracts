const express = require('express');
const router = express.Router();
const path = require('path');

const commit = require('../../Integration/commit.js');
const merge = require('../../Integration/merge.js');

const Models = require('../../Schema/index.js');
const IntegrationModel = Models.Integration;
const taskModel = Models.Tasks;
const projectModel = Models.Projects;
const userModel = Models.Users;


// To get all required info by the fetch  script
router.get('/task/:taskid', async (req, res)=>{
    const {taskid} = req.params;
    
    const task = await taskModel.findOne({_id: taskid});
    const project = await projectModel.findOne({_id: task.projectID});

    await task.populate('testIntegration');
    
    let data = {};

    data['dep_installer'] = task.testIntegration.dependencyInstallerCmd;
    data['test_dest_path'] = task.testIntegration.testDestPath;
    data['test_dest_file_name'] = task.testIntegration.testDestFileName;
    data['open_tests'] = task.testIntegration.tests;
    data['hidden_tests'] = task.testIntegration.hiddenTests;
    data['test_runner'] = task.testIntegration.testRunnerCmd;
    
    return res.status(200).json(data);
});

// To complete the task
router.post('/task', async (req, res)=>{
    const {repoName, repoOwner, taskid, prAuthor, prNum, prTitle, prDescription, tests, testDestPath, testDestFileName} = req.body;
    
    const task  = await taskModel.findOne({_id: taskid});
    const assignedUserGhUname = await userModel.findOne({walletID: task.freelancer},{ghUserName:1}).exec();

    if(assignedUserGhUname !== prAuthor){
        return res.status(401).json({message: "Unauthorized"});
    }

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

module.exports = router;