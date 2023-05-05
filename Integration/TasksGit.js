const express = require('express');
const router = express.Router();

const Models = require('../../Schema/index.js');
const IntegrationModel = Models.Integration;
const taskModel = Models.Tasks;
const projectModel = Models.Projects;

router.get('/taskTrack', async (req, res)=>{
    const {taskid} = req.body;
    const task = await taskModel.findOne({_id: taskid});
    const project = await projectModel.findOne({_id: task.projectID});

    await task.populate('testIntegration');
    console.log(task);

    return res.status(200).send({success: true, message: 'Task tracked', data: task});
});