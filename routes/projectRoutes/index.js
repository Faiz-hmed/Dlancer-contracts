const express = require('express');
const router = express.Router();

const Models = require('../../Schema/index.js');
const { route } = require('../testingRoutes/index.js');
const commitWorkflow = require('../../Integration/workflow.js');
const acceptInvites = require('../../Integration/invites.js')

const userModel = Models.Users;
const projectModel = Models.Projects;
const taskModel = Models.Tasks;
const requestsModel = Models.Requests;

router.get('/',async(req,res)=>{
    const walletID = req.query.walletID;
    // if(!walletID)
    //     projectModel.find({}).then((projects)=>{
    //         console.log(projects)
    //         res.status(200).json(projects);
    //     }).catch((e)=>{
    //         res.status(500).json({success:false,message:e.message})
    //     })
    // else
    userModel.findOne({walletID:walletID}).then((user)=>{
        projectModel.find({ownerID:user._id}).then((projects)=>{
            res.status(200).json(projects);
        })
    }).catch((e)=>{
        res.status(500).json({success:false,message:e.message})
    })
})

router.get('/searchprojects',async(req,res)=>{
    const walletID = req.query.walletID;
        const user = await userModel.findOne({walletID:walletID});
        projectModel.find({}).then((projects)=>{
            const recommended = recommendUsersForProject(user,projects);
            res.status(200).json(recommended);
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

    const {projName,description,skills, repo, branch} = req.body;

    await acceptInvites();

    const repoName = repo.split('/').at(-1);
    const repoOwner = repo.split('/').at(-2);
    
    try {
        if(repoName && repoOwner)
            await commitWorkflow(repoName, branch, repoOwner);            
    }catch(err){
        console.error(err);
        return res.status(400).send({ success: false, message: "Could not commit workflow!" });
    }
    
    const user = await userModel.findOne({walletID:req.params.walletID}).exec();
    console.log({ownerID: user._id, projectName: projName, description: description, requiredSkills: skills})

    if(!Array.isArray(skills)){
        return res.status(400).send({ success: false, message: 'Skills must be an array!' });
    }
    const proj = new projectModel({ownerID: user._id, projectName: projName, description: description, requiredSkills: skills, githubRepoOwner: repoOwner, githubDefaultBranch: branch}); 
    user.projects.push(proj._id);


    try{
        await Promise.all([proj.save(), user.save()]);
        // console.log(repoName,branch,repoOwner,repo,repo.split('/'))

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
        const retTasks = await taskModel.insertMany(qtasks);
        
        project.tasks = project.tasks.concat(retTasks.map(task => task.id));

        await project.save();
    }catch(err){
        return res.status(400).send({ success: false, message: err.message });
    }

    return res.status(200).send({ success: true, message: 'Tasks [& Project] added successfully!' });
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

router.get('/gettask/:taskid', async (req, res) => {
    try{
        const task = await taskModel.findById(req.params.taskid).populate('testIntegration');
        res.status(200).json(task);
        }catch(e){
            res.status(500).json({success:false,message:e.message});
        }
})



function similarity(userSkills, projectSkills) {
    const intersection = userSkills.filter(x => projectSkills.includes(x));
    const union = [...new Set([...userSkills, ...projectSkills])];
    return intersection.length / union.length;
  }
  
  // Define recommendation function
  function recommendUsersForProject(users,projects) {
    const userSkills = users.skills;
    const recommendations = [];
  
    for (const project of projects) {
      const projectSkills = project.requiredSkills;
      const sim = similarity(userSkills, projectSkills);
      recommendations.push({ project, sim });
    }
  
    recommendations.sort((a, b) => b.sim - a.sim);
    return recommendations.map(x=>{x.project.sim = x.sim; return x.project})
    // return recommendations.slice(0, 3).map(x => x.user.name);
  }


module.exports = router;