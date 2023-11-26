const mongoose = require('mongoose');
const ParkingSlot = require('./Models/ParkingSlot'); // Adjust the path based on your project structure
const connectionString = 'mongodb://127.0.0.1:27017/abc';

mongoose.connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');

    // Seed data
    const initialData = [
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:1
        },
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:2
        },
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:3
        },
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:4
        },
        {
            availability: Array.from({ length: 24 }, (_, hour) => ({
                hour,
                isAvail: true,
                paymentIntentId: '',
            })),
            SlotNumber:5
        }
    ];

    try {
        await ParkingSlot.insertMany(initialData);
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close the connection after seeding
        mongoose.connection.close();
    }
});
