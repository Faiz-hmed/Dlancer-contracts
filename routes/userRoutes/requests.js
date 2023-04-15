const router = require('express').Router();

const Models = require('../../Schema/index.js');
const userModel = Models.Users;
const projectModel = Models.Projects;
const requestsModel = Models.Requests;

router.get("/req/:userid", async (req, res) => {
    //Endpoint to get the requests made to a user

    const userId = req.params.userid;
    const user = await userModel.find({walletID: userId}).exec();

    if(user === null){
        return res.status(400).send({ success: false, message: 'User not found!' });
    }

    // May require project name in frontend(to display in requests page), hence populating project
    const requests = user.requests.map(async request => {
        const pReq = await request.populate('project');
        return pReq;
    });

    return res.status(200).send(requests);
});

router.post('/req', async (req, res) => {
    // Endpoint to send requests

    const initiatingUserId = req.body.initiatorId;       
    const resolvingUserId = req.body.resolverId;
    const projectId = req.body.projectId;           // TODO: Use initiator and resolver keywords to identify the users

    const resolverUser = await userModel.findOne({walletID: resolvingUserId}).exec();
    const requestedProject = await projectModel.findOne({id: projectId}).exec();

    if(resolverUser === null || requestedProject === null){
        return res.status(400).send({ success: false, message: 'User/Proj not found!' });
    }

    if(resolverUser.requests === undefined){
        resolverUser.requests = [];
    }

    if(resolverUser.requests.includes(initiatingUserId))
        return res.status(400).send({ success: false, message: 'Request already sent!' });
    
    const request = await requestsModel.create({user: initiatingUserId, project: requestedProject.id})
    
    resolverUser.requests.push(request.id);

    try{
        resolverUser.save();
    } catch(err){
        return res.status(400).send({ success: false, message: err.message });
    }
});

router.delete('/req', async (req, res) => {
    // Endpoint to handle accept/reject-ing of requests

    const requestId = req.body.requestId;
    const resolvingUserId = req.body.resolverId;
    const requestResult = req.body.result;

    const resolverUser = await userModel.findOne({walletID: resolvingUserId}).exec();

    if(resolverUser === null){
        return res.status(400).send({ success: false, message: 'User not found!' });        // Most unlikely to execute
    }
    
    const deletedRequest = await requestsModel.findByIdAndDelete(requestId).exec();
    
    let reqResult = deletedRequest.result;
    initiatorUser = await userModel.findById(deletedRequest.user).exec();
    
    if(reqResult === true){
        // find the project requested
        const project = await projectModel.findById(deletedRequest.project).exec();

        // Case of an invite being send by the resolver
        if(project.ownerID === initiatorUser) {
            Array.isArray(project.collaborators) ? project.collaborators.push(resolverUser.id) : project.collaborators = [resolverUser.id];

            resolverUser.projects.push(project.id);
        }

        // Case of a request being sent, project.ownerID == resolverUser.id
        else {
            Array.isArray(project.collaborators) ? project.collaborators.push(initiatorUser.id) : project.collaborators = [initiatorUser.id];  
            
            initiatorUser.projects.push(project.id);
        }
    }
    

});
