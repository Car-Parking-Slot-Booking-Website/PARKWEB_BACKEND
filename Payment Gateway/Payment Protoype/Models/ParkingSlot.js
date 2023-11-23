// parkingslot.js

const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    paymentIntentId: {
        type: String,
        required: true,
    },
    booked: {
        type: Boolean,
        default: false,
    },
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

module.exports = ParkingSlot;

