const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

//Faiz database 
mongoose.connect('mongodb://localhost:27017/DLancer', {useNewUrlParser: true, useUnifiedTopology: true});
//Shan database
// mongoose.connect(process.env.MONGOSHAN, {useNewUrlParser: true, useUnifiedTopology: true})
const userRoutes = require('./routes/userRoutes/index.js');
const reqRoutes = require('./routes/userRoutes/requests.js');
const projRoutes = require('./routes/projectRoutes/index.js');
const testRoutes = require('./routes/testingRoutes/index.js');
const ghRoutes = require('./routes/ghRoutes/index.js');
const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(morgan('dev'))
app.use(cors({origin:'*'}))
app.use("/api/users", userRoutes);
app.use("/api/req", reqRoutes);
app.use("/api/projects", projRoutes);
app.use("/api/tasks",testRoutes);
app.use("/api/gh",ghRoutes);

const PORT = process.env.PORT || 5000;
try{
app.listen(PORT, function () {
  console.log(`Server started at PORT: ${PORT}`);
})
}catch(e){
  console.error(e)
}
