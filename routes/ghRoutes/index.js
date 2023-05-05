const express = require('express');
const router = express.Router();

const Models = require('../Schema/index.js');
const IntegrationModel = Models.Integration;
const taskModel = Models.Tasks;
const projectModel = Models.Projects;


// To get all required info by the fetch  script
router.get('/taskTrack', async (req, res)=>{
    const {taskid} = req.body;
    const task = await taskModel.findOne({_id: taskid});
    const project = await projectModel.findOne({_id: task.projectID});

    await task.populate('testIntegration');
    
    let res = {};

    res['dep_installer'] = task.testIntegration.dependencyInstallerCmd;
    res['test_dest_path'] = task.testIntegration.testDestPath;
    res['test_dest_file_name'] = task.testIntegration.testDestFileName;
    res['open_tests'] = task.testIntegration.tests;
    res['hidden_tests'] = task.testIntegration.hiddenTests;
    res['workflow_file'] = project.workflowFile;
    
    return res.status(200).json(res);
});

