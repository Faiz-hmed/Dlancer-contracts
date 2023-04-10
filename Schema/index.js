const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
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
    tasksAssigned: Number,
    tasksCompleted: Number,
    
    certs: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Certifications'
    },
    
    requests: {
        type: [mongoose.SchemaTypes.ObjectId],
        ref: 'Users'
    },
    skills: [String]
});

// TODO: Add the Requests Schema -  Done

const projectSchema = new mongoose.Schema({
    ownerID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
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
    },
    taskName: {
        type: String,
        required: true
    },
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

const certSchema = new mongoose.Schema({
    ownerID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Users',
        required: true
    },
    orgIssued: {
        type: String,
        required: true,
    },
    link: String
});


module.exports.Users = mongoose.model('Users', userSchema);
module.exports.Projects = mongoose.model('Projects', projectSchema);
module.exports.Tasks = mongoose.model('Tasks', tasksSchema);
module.exports.Certifications = mongoose.model('Certifications', certSchema);