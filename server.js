require('dotenv').config();

process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message);

  server.close(() => {
    process.exit();
  });
});

process.on('uncaughtException', (error) => {  
  console.log(error.name, error.message); 
  process.exit();
})

const mongoose = require('mongoose');
const app = require('./app');

mongoose.connect(process.env.CONN_STRING, {
  useNewUrlParser:true  
}).then(()=> console.log("Connected to Cloud Database") ).catch((error)=>console.log(`Error occured - ${error}`));

const port = process.env.PORT ;
app.listen(port, () => console.log("Server Started and Listening."));