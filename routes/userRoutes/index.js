const router = require('express').Router();

const Models = require('../../Schema/index.js');
const userModel = Models.Users;
const projectModel = Models.Projects;
const certModel = Models.Certifications;

router.get("/login/:userid", async (req, res) => {
    // Endpoint to check if user is registered

    // Check for user in DB
    const userId = req.params.userid;
    const registeredUser = await userModel.findOne({walletID: userId}).exec();

    if(registeredUser !== null){
        return res.status(200).send({ success: true, message: 'User Registered' });
    }
    else{
        return res.status(400).send({ success: false, message: 'User not registered!' });
    }
});

router.post("/signup", async (req, res) => {
    // Endpoint to register/add a new user

    //Request Body : {walletID, username, email, bio, location, skills}
    const user = new userModel(req.body);

    try{
        user.save();

        return res.status(200).send({ success: true, message: 'User Registered' });
    }catch(err){
        if (err.name === 'MongoError' && err.code === 11000) {
            // Duplicate username
            return res.status(400).send({ success: false, message: 'User already exists!' });
        }
        if(err.name === 'ValidationError'){
            // Check if any of the fields fail schema validation
            console.log(err.message)
            return res.status(400).send({ success: false, message: 'Invalid Data' });
        }
    }
});

router.post("/certs", async (req, res) => {
    // Endpoint to add a certificate to a user
    //Request Body : {userid, ipfsHash, orgIssued}

    //Supply the userid as param, not walletID
    const userId = req.body.userid;
    const ipfsHash = req.body.ipfsHash;
    const orgIssued = req.body.orgIssued;

    const certOwnerUser = await userModel.findOne({_id: userId}).exec();

    if(userId === undefined || certOwnerUser === null || ipfsHash === undefined || orgIssued === undefined){
        return res.status(400).send({ success: false, message: 'Invalid Data/ Missing parameters' });
    }

    const cert = new certModel({user: certOwnerUser.id, ipfsHash: ipfsHash, orgIssued: orgIssued});
    // TODO: Add the certificate to the user's list of certificates

    try{
        cert.save();

        return res.status(200).send({ success: true, message: 'Certificate added successfully!' });
    } catch(err){
        if(err.name === 'ValidationError'){
            // Check if any of the fields fail schema validation (if required fields are not present)
            
            return res.status(400).send({ success: false, message: err.message });
        }
    }
});

router.get('/projects/:userid', async (req, res) => {
    // Endpoint to get all projects by a user(categorised as owned and assigned)
    
    const userId = req.params.userid;
    let user;

    try{
        user = await userModel.findOne({ _id : userId }, 'projects');        
    }
    catch(err){
        if(err.name === 'CastError'){
            return res.status(400).send({ success: false, message: 'Invalid UserId' });
        }
    }
    
    const allUserProjectIds = user.projects;

    if(allUserProjectIds == undefined){
        return res.status(400).send({ success: false, message: 'No Such User found!' });
    }

    const userOwnedProjectDetails = await projectModel.find({ownerID: userId}).exec();
    const userOwnedProjects = userOwnedProjectDetails.map(project => project.id);
    
    const userAssignedProjects = allUserProjectIds.filter(projectId => !userOwnedProjects.includes(projectId));
    const userAssignedProjectDetails = await projectModel.find({ _id : { $in : userAssignedProjects } }).exec();

    const responseObj = {
        ownedProjects: userOwnedProjectDetails,
        assignedProjects: userAssignedProjectDetails
    }

    return res.status(200).send(responseObj);
});

router.get("/", async (req, res) => {           
    // Users list endpoint

    const users = await userModel.find({}).exec();

    return res.status(200).send(users);
});

router.get("/:userid", async (req, res) => {
    // Endpoint to retieve user details

    const userId = req.params.userid;
    const user = await userModel.findOne({_id: userId}).exec();
    
    await user.populate(['projects','certs','requests']);

    if(user === null){
        return res.status(400).send({ success: false, message: 'User not found!' });
    }

    return res.status(200).send(user);
});

module.exports = router;