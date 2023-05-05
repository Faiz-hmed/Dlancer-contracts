const mongoose = require('mongoose');


const certSchema = new mongoose.Schema({
    // ownerID: {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: 'Users',
    //     required: true
    // },
    title: {
        type:String,
        required: true
    },
    link:{
        type:String,
        required:true
    },
    org: {
        type: String,
        required: true,
    }
});



const userSchema = new mongoose.Schema({
    ghUserName :{
        type:String,
    },
    username: {
        type: String,
        required: true
    },
    projects : {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Projects'
    },
    email:{
        type: String,
        required: true,
        unique: true
    },

    walletID: {
        type: String,
        required: true,
        unique: true
    },
    bio: String,
    location: String,
    tasksAssigned: {
        type:[mongoose.SchemaTypes.ObjectId],
        ref:'Tasks',
        default:[]
    },
    tasksCompleted: {
        type:[mongoose.SchemaTypes.ObjectId],
        ref:'Tasks',
        default:[]
    },
    rating:{
        type:Number,
        default:4
    },
    image:{
        type:String,
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpCKq1XnPYYDaUIlwlsvmLPZ-9-rdK28RToA&usqp=CAU"
    },
    certs: [certSchema],
    
    requests: {                     //Keeps track of only the requests 'received'
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Requests'
    },
    skills: [Number]
});


const reqSchema = new mongoose.Schema({
    user: {                         // User who sent the request [From POV of Receiving user]
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true
    },
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Projects'
    },
});


const projectSchema = new mongoose.Schema({
    ownerID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true
    },
    description:{
        type:String,
        required:true
    },
    githubDefaultBranch:{
        type:String,
        // required:true
    },
    githubRepoOwner:{
        type:String,
        // required:true
    },
    requiredSkills:{
        type: [String],
    },
    projectName: {
        type: String,
        required: true
    },
    tasks: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Tasks'
    },
    collaborators: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Users',
        required: true
    },
    status:{
        type: Number,
        enum: [0, 1, 2],            // 0: Incomplete, 1: In Progress, 2: Completed
        default: 0
    }
});


const tasksSchema = new mongoose.Schema({
    projectID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Projects',
        required: true
    },
    freelancer: {
        type: String,
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    requiredSkills:{
        type:[String],
        required:true,
    },
    contractAddress: {              // For storing the contract address of the task
        type: String,
        required:true
    },
    testIntegration : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Integration'
        // required: true
    }
});


const githubIntSchema = new mongoose.Schema({
    dependencyInstallerCmd : {
        type: String,
        // required: true
    },
    visibleTests: {
        type: String,
        required: true
    },
    hiddenTests: {
        type: String                //(Optional)
    },
    testDestFileName : {
        type: String,               //Eg, "test.py"
    },
    testDestPath: {
        type: String,               //Eg, "tests/suite1" (Relative to the root of the repo, should be a directory)
        required: true
    },
    testRunnerCmd: {
        type: String,               //Eg, "python3 test.py" (Inclusive of args & options, eg. "python3 test.py arg1 arg2")
        required: true
    },
});

module.exports.Integration = mongoose.model('Integration', githubIntSchema);
module.exports.Requests = mongoose.model('Requests', reqSchema);
module.exports.Users = mongoose.model('Users', userSchema);
module.exports.Projects = mongoose.model('Projects', projectSchema);
module.exports.Tasks = mongoose.model('Tasks', tasksSchema);
module.exports.Certifications = mongoose.model('Certifications', certSchema);