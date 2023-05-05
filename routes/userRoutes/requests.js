const router = require('express').Router();

const { default: mongoose } = require('mongoose');
const Models = require('../../Schema/index.js');
const userModel = Models.Users;
const projectModel = Models.Projects;
const requestsModel = Models.Requests;

router.get("/:walletID", async (req, res) => {
    //Endpoint to get the requests made to a user
    const userforid = await userModel.findOne({walletID:req.params.walletID});
    const userId = userforid._id;
    const user = await userModel.findOne({_id: userId}).exec();
    // const requests = await userModel.findOne({_id:userId}).populate('requests').populate('project');

    if(user === null){
        return res.status(400).send({ success: false, message: 'User not found!' });
    }

    // May require 'project name' in frontend(to display in requests page), hence populating project
    const requests = await Promise.all(user.requests.map(async requestId => {

        let request = await requestsModel.findOne({_id: String(requestId)}).populate({path: 'project',select: 'projectName ownerID'});
        const userobj = await userModel.findById(request.user,{username:1,walletID:1,_id:0});
        
        let mode = 1;   // Request (default)
        if(request.project.ownerID.toString() === request.user.toString())         
            mode = 0;   // Invite
        
        return {...request, mode: mode,username:userobj.username,walletID:userobj.walletID};
    }));

    return res.status(200).send(requests);
});

router.post('/', async (req, res) => {      // Running into infinite loop 
    // Endpoint to send requests

    // Request body: {initiatorId (userid), resolverId (userid), projectId}
    const walletID = req.body.initiatorId;
    const initiator = await userModel.findOne({walletID:walletID}).exec();
    const initiatingUserId = initiator._id;
    const resolvingUserId = req.body.resolverId;
    const projectId = req.body.projectId;
    // Initiator and resolver keywords are used to identify the users (Request sender and receiver)

    const resolverUser = await userModel.findById(resolvingUserId).exec();
    const requestedProject = await projectModel.findById(projectId).exec();
    let flag=false;
    requestedProject.collaborators.map((collab)=>{
        if(flag) return;
        if(resolverUser._id.toString()==requestedProject.ownerID.toString() && collab.toString()==initiatingUserId.toString())
            flag=true;
        if(collab.toString()==resolvingUserId && initiatingUserId.toString()==requestedProject._id.toString())
            flag=true;
    })
    if(flag)
        return res.status(200).send({ success: false, message: 'User already a collaborator' });
    if(resolverUser === null || requestedProject === null){
        return res.status(400).send({ success: false, message: 'User/Proj not found!' });
    }

    if(resolverUser.requests === undefined){
        resolverUser.requests = [];
    }

    const duplicateReq = await requestsModel.findOne({user: initiatingUserId, project: requestedProject.id}).exec();
    if(duplicateReq !== null)
        return res.status(400).send({ success: false, message: 'Request already sent!' });

    const request = await requestsModel.create({user: initiatingUserId, project: requestedProject.id})
    
    resolverUser.requests.push(request.id);

    try{
        await resolverUser.save();

        return res.status(200).json({ success: true, message: 'Request sent successfully!' });
    } catch(err){
        return res.status(400).json({ success: false, message: err.message });
    }
});

router.post('/handle', async (req, res) => {
    // Endpoint to handle accept/reject-ing of requests

    //Request body: {requestId, resolverId(userid) , result}
    console.log(req.body)
    const requestId = req.body.requestId;
    const resolverWalletID = req.body.resolverId;
    const resolvingUser = await userModel.findOne({walletID:resolverWalletID}).exec();
    const resolvingUserId = resolvingUser._id;
    const requestResult = req.body.result;

    const resolverUser = await userModel.findOne({_id: resolvingUserId}).exec();

    if(resolverUser === null){
        return res.status(400).send({ success: false, message: 'User not found!' });        // Most unlikely to execute
    }
    
    // Find the request in the Requests collection, and in the `User` request field, and remove from both 
    const deletedRequest = await requestsModel.findByIdAndDelete(requestId).exec();
    
    if((reqInd = resolverUser.requests.indexOf(requestId)) !== -1){
        resolverUser.requests.splice(reqInd, 1);
    }
    await resolverUser.save();

    
    const initiatorUser = await userModel.findById(deletedRequest.user).exec();
    
    if(requestResult == true){
        // find the project requested
        const project = await projectModel.findById(deletedRequest.project).exec();
        // Case of an invite being send by the resolver
        if(project.ownerID.toString() == initiatorUser._id.toString()) {
            Array.isArray(project.collaborators) ? project.collaborators.push(resolverUser.id) : project.collaborators = [resolverUser.id];

            resolverUser.projects.push(project.id);
            await resolverUser.save();
        }

        // Case of a request being sent, project.ownerID == resolverUser.id
        else {
            Array.isArray(project.collaborators) ? project.collaborators.push(initiatorUser.id) : project.collaborators = [initiatorUser.id];  
            
            initiatorUser.projects.push(project.id);
            await initiatorUser.save();
        }

        await project.save();

        return res.send({ success: true, message: 'Request accepted!' });
    }
    
    // TODO: Remove the request from the user's requests array  - DONE

    return res.send({ success: true, message: 'Request rejected!' });
});

module.exports = router;