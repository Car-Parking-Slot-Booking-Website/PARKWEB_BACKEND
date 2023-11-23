const mongoose = require('mongoose');

//creating a slot schema
let slotSchema = new mongoose.Schema({
    availability: [
        {
            hour: Number,
            isAvail:Boolean,
            paymentIntentId: String
        }
        
    ],
    booked: {
        type: Boolean,
        default: false
    }
});

//creating model
let Slot = mongoose.model('Slot', slotSchema)

module.exports = Slot; //sending the model to be used anywhere when required
