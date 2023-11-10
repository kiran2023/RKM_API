const env = require('dotenv');
env.config({ path:'./config.env' });

const mongoose = require('mongoose');
const fs = require('fs');

console.log(process.env)
const productSchema = require('../models/product');

mongoose.connect(process.env.CONN_STRING, {
    useNewUrlParser: true
}).then(() => console.log("Connected to Cloud Database")).catch((error) => console.log(`Error occured - ${error}`));

let products = JSON.parse(fs.readFileSync('./Datas/products.json'));

const addProducts = async(request, response) => {
    try{
        await productSchema.create(products);
        console.log("Products Added Successfully into the Database");
    }catch(error){
        console.log(`Error - ${error} `);
    }
}

const removeProducts = async(request, response) => {
    try{
        await productSchema.deleteMany();
        console.log("Products Removed Successfully from the Database");
    }catch(error){
        console.log(`Error - ${error} `);
    }
    process.exit();
}

if(process.argv[2]=='--add'){
    addProducts();
}
if(process.argv[2]=='--remove'){
    removeProducts();
}