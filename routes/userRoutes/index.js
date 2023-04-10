const router = require('express').Router();

const Models = require('../../Schema/index.js');
const userModel = Models.Users;
const projectModel = Models.Projects;

router.get("/", async (res, req) => {           
    // Users list endpoint
    const query = req.query;
    const users = await userModel.find({}).exec();

    return res.status(200).send(users);
});

router.get("/login/:userid", async (req, res) => {
    // Check for user in DB
    const userId = req.params.userid;
    const registeredUser = await userModel.findOne({walletID: userId}).exec();

    if(registeredUser !== null){
        return res.status(200).send(true);
    }
    else{
        return res.status(400).send(false);
    }
});

router.post("/signup", async (req, res) => {
    //Request Body : {walletID, username, email, bio, location, skills}
    const user = new userModel(req.body);

    try{
        user.save();
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

router.get("/:userid", async (req, res) => {
    // Get user details
    const userId = req.params.userid;
    const user = await userModel.findOne({walletID: userId}).exec();
    const projects = await projectModel.find({ownerID: userId}).exec();

    if(user === null){
        return res.status(400).send({ success: false, message: 'User not found!' });
    }

    const userDet = {...user, ...projects};
    return res.status(200).send(userDet);
});