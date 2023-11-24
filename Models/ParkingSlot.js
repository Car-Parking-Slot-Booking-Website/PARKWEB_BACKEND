// parkingslot.js

const mongoose = require('mongoose');

let parkingSlotSchema = new mongoose.Schema({
    availability: [
        {
            hour: Number,
            isAvail:Boolean,
            paymentIntentId: String
        }
        
    ]
});


const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

module.exports = ParkingSlot;

