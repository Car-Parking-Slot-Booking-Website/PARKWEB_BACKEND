const express = require('express');
const app = express(); // instance
const path = require('path');
const mongoose = require('mongoose');
const seedDB = require("./seed");
const CityRoutes = require('./routes/CityRoutes');
const LocationRoutes = require('./routes/LocationRoutes');
const SPRoutes = require('./routes/SPRoutes');
// const methodOverride = require('method-override');

app.use(express.urlencoded({ extended: true }));

//middleware for routers
app.use(CityRoutes); // vvv imp
app.use(LocationRoutes); // vvv imp
app.use(SPRoutes); // vvv imp

mongoose.connect('mongodb+srv://kush:kushparking@parking.rlrwlky.mongodb.net/?retryWrites=true&w=majority&appName=parking')
.then(() => { console.log("DB CONNECTED") })
.catch((err)=>{console.log("error while connecting DB",err)})

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, 'public')))


// seedCity()

let PORT = 8081;
app.listen(PORT, () => {
    console.log(`server connected at port ${PORT}`);
})
