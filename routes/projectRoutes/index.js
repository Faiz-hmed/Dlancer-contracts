const express = require('express');
const router = express.Router();

const Models = require('../../Schema/index.js');
const { route } = require('../testingRoutes/index.js');
const userModel = Models.Users;
const projectModel = Models.Projects;
const taskModel = Models.Tasks;
const requestsModel = Models.Requests;

// TODO: Create endpoint to add users to a project

router.get('/',async(req,res)=>{
    const walletID = req.query.walletID;
    userModel.findOne({walletID:walletID}).then((user)=>{
        projectModel.find({ownerID:user._id}).then((certificates)=>{
            res.status(200).json(certificates);
        })
    }).catch((e)=>{
        res.status(500).json({success:false,message:e.message})
    })
})

router.get('/otherprojects',async(req,res)=>{
    const walletID = req.query.walletID;
    userModel.findOne({ walletID: walletID.toLowerCase() })
  .populate({ path: 'tasksAssigned', populate: { path: 'projectID' } }).then((user)=>{
        dict = {}
        for(ind in user.tasksAssigned)
            dict[user.tasksAssigned[ind].projectID._id.toString()]=user.tasksAssigned[ind].projectID;
        res.status(200).json(Object.values(dict))
    }).catch((e)=>{
        res.status(500).json({success:false,message:e.message})
    })
})

router.get('/other',async(req,res)=>{
    try{
    const walletID = req.query.walletID;
    userModel.findOne({walletID:walletID}).populate('tasksAssigned').then((user)=>{
        // projectModel.find({ownerID:user._id}).then((certificates)=>{
            res.status(200).json(user.tasksAssigned);
        // })
    }).catch((e)=>{
        res.status(500).json({success:false,message:e.message})
    })
}catch(e){
    console.log(e);
}
    
})


router.post('/:walletID', async (req, res) => {
    // Enpoint to create a new project w/o tasks

    //Request Body : {userid, projName, description, skills, tasks, status(0/1/2) }
    const {projName,description,skills} = req.body;

    const user = await userModel.findOne({walletID:req.params.walletID}).exec();
    console.log({ownerID: user._id, projectName: projName, description: description, requiredSkills: skills})

    if(!Array.isArray(skills)){
        return res.status(400).send({ success: false, message: 'Skills must be an array!' });
    }
    const proj = new projectModel({ownerID: user._id, projectName: projName, description: description, requiredSkills: skills});
    user.projects.push(proj._id);
    // TODO: Add the project into the user's projects array - DONE

    try{
        await Promise.all([proj.save(), user.save()]);
        res.status(200).send({ success: true, message: 'Project added successfully!' });

    }catch(err){
        console.error(err)
        return res.status(400).send({ success: false, message: err.message+err.name });
    }

    //Save Project to db, and continue if and only if successful && tasks are present
    // if(!tasks)
    //     return res.status(200).send({ success: true, message: 'Project added successfully!' });

    // await taskInsert(tasks, proj.id, res);
});

router.post('/tasks', async (req, res) => {
    // Endpoint to add tasks to a project
    //Request Body : {projid, tasks(array)}

    const tasks = req.body.tasks;
    const projid = req.body.projid;

    if(tasks == undefined || projid == undefined){
        return res.status(400).send({ success: false, message: 'Project ID and Tasks must be present!' });
    }

    await taskInsert(tasks, projid, res);
});

// Task Req body: {projid, taskName, starttime, endtime, description, isCompleted(true/false)}
async function taskInsert(tasks, projid, res){
    // Function to handle task creation

    const project = await projectModel.findById(projid).exec();

    if(!Array.isArray(tasks)){
        return res.status(400).send({ success: false, message: 'Tasks must be an array!' });
    }

    for(const task of tasks){
        if(!task.hasOwnProperty('taskName') && !task.hasOwnProperty('description') && !task.hasOwnProperty('startTime') && !task.hasOwnProperty('endTime') && !task.hasOwnProperty('isCompleted')){
            return res.status(400).send({ success: false, message: 'Task must have name, description and endTime!' });
        }
    }

    const qtasks = tasks.map(task => {return {projectID : projid, ...task}});

    try{
        const retTasks = await taskModel.insertMany(qtasks);                         // might need to do: sequential task insertion
        
        project.tasks = project.tasks.concat(retTasks.map(task => task.id));

        await project.save();
    }catch(err){
        return res.status(400).send({ success: false, message: err.message });
    }

    return res.status(200).send({ success: true, message: 'Tasks added successfully!' });
}

router.get('/:projectid', async (req, res) => {
    const projectid = req.params.projectid;
    const projDetail = await projectModel.findById(projectid)
    .populate({
      path: 'ownerID',
      model: 'Users',
      select: 'walletID'
    })
    .populate({
      path: 'collaborators',
      model: 'Users',
      select: 'walletID'
    })
    .populate('tasks')
    .exec();
    if(projDetail === null){
        return res.status(400).send({ success: false, message: 'Project not found!' });
    }
    return res.status(200).send(projDetail);
});



module.exports = router;