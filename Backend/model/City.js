const mongoose = require('mongoose');

//Creating a City Schema
let CitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    img: {
        type: String,
        trim:true
    },
    locations: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Location'
        }
    ]
});

//creating model
let City = mongoose.model('City', CitySchema)

module.exports = City; //sending the model to be used anywhere when required
