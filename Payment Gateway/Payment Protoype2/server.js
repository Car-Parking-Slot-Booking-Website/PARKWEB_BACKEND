// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51OErf1SJWtVxyJd5HCDNnJk9OxstOJIxGBDJfvAzbbn3n6GSrqhZiYMcpaTv8EjEpi1nT4o9s8ckOkbIYbpifeug00wrV1MlnM'); // Add your Stripe secret key here

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/abc', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const parkingSlotSchema = new mongoose.Schema({
    availability: [
        {
            hour: Number,
            isAvail: Boolean,
            paymentIntentId: String,
        },
    ],
    SlotNumber: {
        type: Number,
    },
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

app.use(bodyParser.json());
app.use(cors());

let storedStartTime;
let bookedSlotNumber; // Added to store booked slot number

app.get('/favicon.ico', (req, res) => res.status(204));

// server.js

// ... (previous code)

app.post('/checkSlotAvailability', async (req, res) => {
    try {
        const startTime = req.body.startTime;

        const availableSlots = await ParkingSlot.find({
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour': startTime
                }
            }
        });

        res.json({ slotAvailable: availableSlots.length > 0, availableSlots });
    } catch (error) {
        console.error('Error checking slot availability:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// ...

app.post('/getAvailableSlotCount', async (req, res) => {
    try {

        // Update the global variable with the count of available slots
        noOfSlotsAvail = await ParkingSlot.countDocuments({
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour': storedStartTime
                }
            }
        });

        res.json({ slotCount: noOfSlotsAvail });
    } catch (error) {
        console.error('Error getting slot count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ...

// ... (remaining code)



app.post('/storeStartTime', async (req, res) => {
    try {
        const startTime = req.body.startTime;

        if (isNaN(startTime) || startTime < 0 || startTime > 23) {
            return res.status(400).json({ error: 'Invalid start time. Please enter a valid hour (0-23).' });
        }

        const availableSlots = await ParkingSlot.find({
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour': startTime
                }
            }
        });

        if (availableSlots.length > 0) {
            storedStartTime = startTime;
            console.log('Start time stored on the server:', storedStartTime);
            res.status(200).json({ startTime: storedStartTime });
        } else {
            res.status(404).json({ error: `No Available Parking Slot for hour ${startTime}` });
        }
    } catch (error) {
        console.error('Error storing start time:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/start-payment', async (req, res) => {
    try {
        const startTime = storedStartTime;

        if (isNaN(startTime) || startTime < 0 || startTime > 23) {
            return res.status(400).json({ error: 'Invalid start time. Please enter a valid hour (0-23).' });
        }

        const availableSlots = await ParkingSlot.find({
            'availability': {
                $elemMatch: {
                    'isAvail': true,
                    'hour': startTime
                }
            }
        });

        if (availableSlots.length === 0) {
            console.error(`No available parking slot found for hour ${startTime}`);
            return res.status(404).json({ error: `No Available Parking Slot for hour ${startTime}` });
        }

        // Proceed to payment logic
        // ... (remaining code for payment logic)
    } catch (error) {
        console.error('Error starting payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ... (other imports and configurations)

// ... (other imports and configurations)

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = req.body;

        console.log('Received webhook event:', JSON.stringify(event, null, 2));

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                const startTime = storedStartTime;

                if (isNaN(startTime) || startTime < 0 || startTime > 23) {
                    return res.status(400).json({ error: 'Invalid start time received in webhook.' });
                }

                // Find the first available slot for the specified start time
                const availableSlot = await ParkingSlot.findOneAndUpdate(
                    {
                        'availability': {
                            $elemMatch: {
                                'isAvail': true,
                                'hour': startTime
                            }
                        }
                    },
                    {
                        $set: {
                            'availability.$.isAvail': false,
                            'availability.$.paymentIntentId': paymentIntent.id,
                        },
                    },
                    { new: true }
                );

                if (!availableSlot) {
                    console.error(`No available parking slot found for hour ${startTime}`);
                    return res.status(404).json({ error: `No Available Parking Slot for hour ${startTime}` });
                }

                // Update the booked slot number globally
                bookedSlotNumber = availableSlot.SlotNumber;

                console.log('Parking slot updated successfully:', availableSlot);

                // Include SlotNumber in the response
                res.status(200).json({
                    message: `Slot ${bookedSlotNumber} booked successfully`,
                    slotNumber: bookedSlotNumber
                });
                break;

            default:
                console.log('Unhandled event type:', event.type);
                res.status(400).json({ error: 'Unhandled event type' });
        }
    } catch (error) {
        console.error('Error processing webhook event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ... (other routes and configurations)


// ... (other routes and configurations)

app.get('/fetch-slot', async (req, res) => {
    try {
        // Use the globally stored booked slot number
        const slotNumber = bookedSlotNumber;

        if (!slotNumber) {
            return res.status(400).json({ error: 'No slot number available. Please book a slot first.' });
        }

        // Send the slot information in the response
        res.status(200).json({ slotNumber: slotNumber });
    } catch (error) {
        console.error('Error fetching slot information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ... (other routes and configurations)

app.get('/input.html', (req, res) => {
    res.sendFile(__dirname + '/input.html');
});

app.get('/start-payment', (req, res) => {
    res.sendFile(__dirname + '/start-payment.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
