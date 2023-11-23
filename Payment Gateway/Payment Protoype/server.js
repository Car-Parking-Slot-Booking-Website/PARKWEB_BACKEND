const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51OErf1SJWtVxyJd5HCDNnJk9OxstOJIxGBDJfvAzbbn3n6GSrqhZiYMcpaTv8EjEpi1nT4o9s8ckOkbIYbpifeug00wrV1MlnM');

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/abc');
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const parkingSlotSchema = new mongoose.Schema({
    paymentIntentId: String,
    booked: Boolean,
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const event = req.body;

    // Log the raw event for testing
    console.log('Received webhook event:', JSON.stringify(event, null, 2));

    // Handle specific events
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            // Find an available slot, you might need to adjust this condition based on your business logic
            const availableSlot = await ParkingSlot.findOne({ booked: false });

            if (!availableSlot) {
                console.error('No available parking slot found.');
                return res.status(404).json({ error: 'No Available Parking Slot' });
            }

            // Update the slot to booked and set the paymentIntentId
            const updatedSlot = await ParkingSlot.findOneAndUpdate(
                { _id: availableSlot._id },
                { $set: { booked: true, paymentIntentId: paymentIntent.id } },
                { new: true }
            );

            console.log('Parking slot updated successfully:', updatedSlot);
            break;

        // Handle other events as needed

        default:
            console.log('Unhandled event type:', event.type);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).end();
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
