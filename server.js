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
            booked: Boolean,
        },
    ],
});

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);

app.use(bodyParser.json());
app.use(cors());

let storedStartTime;
app.get('/favicon.ico', (req, res) => res.status(204));
// Handle POST request to store start time
app.post('/storeStartTime', (req, res) => {
    const startTime = req.body.startTime;
    console.log('start time recieved in storeStartTime route :',storedStartTime)
    if (isNaN(startTime) || startTime < 0 || startTime > 23) {
        return res.status(400).json({ error: 'Invalid start time. Please enter a valid hour (0-23).' });
    }

    storedStartTime = startTime;
    console.log('Start time stored on the server:', storedStartTime);

    // Respond with a success message or any other data you want to send back
    res.json({ startTime: storedStartTime });
});

app.post('/start-payment', async (req, res) => {
    try {
        // Use the stored start time from the /storeStartTime endpoint
        const startTime = storedStartTime;
        console.log('start time recieved in start-payment route :',startTime)           //this console statement is not getting printed
        if (isNaN(startTime) || startTime < 0 || startTime > 23) {
            return res.status(400).json({ error: 'Invalid start time. Please enter a valid hour (0-23).' });
        }

        const availableSlot = await ParkingSlot.findOne({
            'availability.hour': startTime,
            'availability.isAvail': true,
            'availability.booked': false,
        });

        if (!availableSlot) {
            console.error(`No available parking slot found for hour ${startTime}`);
            return res.status(404).json({ error: `No Available Parking Slot for hour ${startTime}` });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 3000,
            currency: 'inr',
        });

        const updatedSlot = await ParkingSlot.findOneAndUpdate(
            {
                'availability.hour': startTime,
                'availability.isAvail': true,
            },
            {
                $set: {
                    'availability.$.isAvail': false,
                    'availability.$.paymentIntentId': paymentIntent.id,
                },
            },
            { new: true }
        );

        console.log('Parking slot updated successfully:', updatedSlot);
        res.status(200).json({ message: 'Slot booked successfully' });
    } catch (error) {
        console.error('Error creating PaymentIntent or updating slot:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Your existing code for handling the webhook
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = req.body;

        console.log('Received webhook event:', JSON.stringify(event, null, 2));

        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;

                const startTime = storedStartTime;
                console.log(typeof(startTime));
                console.log('Start time received in webhook:', startTime);
                if (isNaN(startTime) || startTime < 0 || startTime > 23) {
                    return res.status(400).json({ error: 'Invalid start time received in webhook.' });
                }
                
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

                console.log('Parking slot updated successfully:', availableSlot);
                res.status(200).json({ message: 'Slot booked successfully' });
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
