const express = require('express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/DLancer', {useNewUrlParser: true, useUnifiedTopology: true});

const userRoutes = require('./routes/userRoutes/index.js');
const reqRoutes = require('./routes/userRoutes/requests.js');

const app =  express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/req", reqRoutes);

// app.get('/', (req, res) => {
//     res.send('Hello World');
// });


const PORT = process.env.PORT || 5000;
app.listen(PORT, function () {
  console.log(`Server started at PORT: ${PORT}`);
});
