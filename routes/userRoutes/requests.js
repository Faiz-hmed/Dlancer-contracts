const router = require('express').Router();

const Models = require('../../Schema/index.js');
const userModel = Models.Users;
const projectModel = Models.Projects;
const requestsModel = Models.Requests;

router.get("/:userid", async (req, res) => {
    //Endpoint to get the requests made to a user

    const userId = req.params.userid;
    const user = await userModel.findOne({_id: userId}).exec();

    if(user === null){
        return res.status(400).send({ success: false, message: 'User not found!' });
    }

    // May require 'project name' in frontend(to display in requests page), hence populating project
    const requests = await Promise.all(user.requests.map(async requestId => {

        let request = await requestsModel.findOne({_id: String(requestId)}).exec();
        await request.populate('project');

        let mode = 0;   // Request (default)
        if(request.project.ownerID === request.user)         
            mode = 1;   // Invite
        
        return {...request, mode: mode};
    }));

    return res.status(200).send(requests);
});

router.post('/', async (req, res) => {      // Running into infinite loop 
    // Endpoint to send requests

    // Request body: {initiatorId (userid), resolverId (userid), projectId}

    const initiatingUserId = req.body.initiatorId;
    const resolvingUserId = req.body.resolverId;
    const projectId = req.body.projectId;
    // Initiator and resolver keywords are used to identify the users (Request sender and receiver)

    const resolverUser = await userModel.findOne({_id: resolvingUserId}).exec();
    const requestedProject = await projectModel.findOne({_id: projectId}).exec();


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

        return res.status(200).send({ success: true, message: 'Request sent successfully!' });
    } catch(err){
        return res.status(400).send({ success: false, message: err.message });
    }
});

router.post('/handle', async (req, res) => {
    // Endpoint to handle accept/reject-ing of requests

    //Request body: {requestId, resolverId(userid) , result}

    const requestId = req.body.requestId;
    const resolvingUserId = req.body.resolverId;
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
        if(project.ownerID === initiatorUser) {
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