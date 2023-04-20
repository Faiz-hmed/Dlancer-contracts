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
        type:Number,
        default:0
    },
    tasksCompleted: {
        type:Number,
        default:0
    },
    image:{
        type:String,
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpCKq1XnPYYDaUIlwlsvmLPZ-9-rdK28RToA&usqp=CAU"
    },
    certs: [certSchema],
    // {
    //     type: [mongoose.SchemaTypes.ObjectId],
    //     ref: 'Certifications'
    // },
    
    requests: {  //Keeps track of only the requests 'received'
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Requests'
    },
    skills: [Number]
});
const reqSchema = new mongoose.Schema({
    user: {     // User who sent the request [From POV of Receiving user]
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true
    },
    project: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Projects'
    },
    // mode:{      // To specify if the request is to invite for collaboration or apply for project
    //     type:Number,
    //     default:0,
    // } 
});

const projectSchema = new mongoose.Schema({
    ownerID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true
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
        enum: [0, 1, 2]     // 0: Incomplete, 1: In Progress, 2: Completed
    }
});

const tasksSchema = new mongoose.Schema({
    projectID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Projects',
        required: true
    },
    taskName: {
        type: String,
        required: true
    },
    // contractAddress: {    // For storing the contract address of the task
    //     type: String,
    //     required:true
    // },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date,
        required: true
    },
    taskDescription: {
        type: String
    },
    isCompleted: Boolean
});



module.exports.Requests = mongoose.model('Requests', reqSchema);
module.exports.Users = mongoose.model('Users', userSchema);
module.exports.Projects = mongoose.model('Projects', projectSchema);
module.exports.Tasks = mongoose.model('Tasks', tasksSchema);
module.exports.Certifications = mongoose.model('Certifications', certSchema);