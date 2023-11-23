const mongoose = require('mongoose');

//Creating a Location Schema
let LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    img: {
        type: String,
        trim:true
    },
    sp: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'SP'
        }
    ]
});

//creating model
let Location = mongoose.model('Location', LocationSchema)

module.exports = Location; //sending the model to be used anywhere when required
