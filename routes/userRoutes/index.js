const router = require('express').Router();
const mongoose = require('mongoose')
const Models = require('../../Schema/index.js');
const { reset } = require('nodemon');
const userModel = Models.Users;
const projectModel = Models.Projects;
const certModel = Models.Certifications;

router.get("/signin/:walletid", async (req, res) => {
    // Endpoint to check if user is registered

    // Check for user in DB
    const walletid = req.params.walletid;
    const registeredUser = await userModel.findOne({walletID: walletid}).exec();

    if(registeredUser !== null){
        return res.status(200).send({ _id: registeredUser.id, success: true, message: 'User Registered' });
    }
    else{
        return res.status(403).send({ success: false, message: 'User not registered!' });
    }
});



router.post("/edit/:walletID",async (req,res)=>{
    try{
        await userModel.findOneAndUpdate({walletID:req.params.walletID}, req.body, {new:true});
        res.status(200).json({success:true,message:"user updated"});
    }
    catch(e)
    {
        console.error(e);
        res.status(500).json({success:false,message:e.message})
    }

})

router.post("/signup", async (req, res) => {
    // Endpoint to register/add a new user

    //Request Body : {walletID, username, email, bio, location, skills}
    const {walletID,username,email,bio,location,skills,certificates} = req.body;

    const user = new userModel({
        username:username,
        email:email,
        walletID:walletID,
        bio:bio,
        location:location,
        skills:skills,
        certs: certificates,
      });

    try{
        await user.save()
        return res.status(200).send({ success: true, message: 'User Registered' });
    }catch(err){
        console.log(err)
        if (err.name === 'MongoError' && err.code === 11000) {
            // Duplicate username
            return res.status(400).send({ success: false, message: 'User already exists!' });
        }
        if(err.name === 'ValidationError'){
            // Check if any of the fields fail schema validation
            
            return res.status(400).send({ success: false, message: 'Invalid Data' });
        }
    }
});

router.post('/addcert/:walletID',async(req,res)=>{
    try{
        const user = await userModel.findOne({walletID:req.params.walletID}); // get the user object from the database using the user ID
        user.certs.push(req.body); // add the new certificate to the user's certs array
        await user.save();

        res.status(200).json({success:true,message:"updated successfully"})

    }catch(e){
        console.error(e)
        res.status(500).json({success:false,message:e.message})
    }
})



router.delete('/removecert/:walletID',async(req,res)=>{
    try{
        const user = await userModel.findOne({walletID:req.params.walletID}); // get the user object from the database using the user ID
        user.certs = user.certs.filter((cert)=>{
           return cert._id.toString()!= req.query.certID
        }); // remove the new certificate to the user's certs array
    
        await user.save();
        res.status(200).json({success:true,message:"updated successfully"})

    }catch(e){
        console.error(e)
        res.status(500).json({success:false,message:e.message})
    }
})

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
    certOwnerUser.certifications.push(cert.id);
    
    // TODO: Add the certificate to the user's list of certificates - DONE

    try{
        await Promise.all([cert.save(), certOwnerUser.save()]);

        return res.status(200).send({ success: true, message: 'Certificate added successfully!' });
    }catch(err){
        if(err.name === 'ValidationError'){
            // Check if any of the fields fail schema validation (if required fields are not present)
            
            return res.status(400).send({ success: false, message: err.message });
        }
    }
});

router.get("/certs/:walletid", async (req, res) => {           
    // Users list endpoint
    const walletID = req.params.walletid;
    const users = await userModel.findOne({walletID:walletID}).then((user)=>{
        return res.status(200).send(user.certs);
    }).catch((e)=>{
        return res.status(500).send({success:false,message:e.message})
    })
});

router.get('/:userid/projects', async (req, res) => {
    // Endpoint to get all projects by a user(categorised as owned and assigned)

    const userId = req.params.userid;
    let user;

    try{
        user = await userModel.findOne({ _id : userId });
 
        if(user == null){
            return res.status(400).send({ success: false, message: 'User not found' });
        }
    }
    catch(err){
        if(err.name === 'CastError'){
            return res.status(400).send({ success: false, message: 'Invalid UserId' });
        }
        return res.status(400).send({ success: false, message: 'Error occured' });
    }

    const allUserProjectIds = user.projects.map(projectid => String(projectid));

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
    const users = await userModel.find({},{walletID:1,tasksCompleted:1,skills:1,image:1,username:1}).exec();

    return res.status(200).send(users);
});

router.get("/:walletid", async (req, res) => {
    // Endpoint to retieve user details (Projects as id)

    const walletid = req.params.walletid;
    let user;
    try {
        user = await userModel.findOne({walletID:walletid})
        // user = await userModel.findOne({_id: userId}).exec();         // TODO: handle CastError in case of fallthrough from project route - Done
    } catch(err){
        if(err.name === 'CastError'){
            return res.status(400).send({ success: false, message: 'Invalid UserId' });
        }
        return res.status(400).send({ success: false, message: 'Error occured' });
    }
    
    // await user.populate(['certs','requests']);

    if(user === null){
        return res.status(400).send({ success: false, message: 'User not found!' });
    }

    return res.status(200).send(user);
});

module.exports = router;