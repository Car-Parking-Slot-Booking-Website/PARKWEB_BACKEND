const mongoose = require('mongoose');
const ParkingSlot = require('./Models/ParkingSlot'); // Adjust the path based on your project structure
const connectionString = 'mongodb://127.0.0.1:27017/abc';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('Connected to MongoDB');

    // Seed data
    const initialData = [
        { paymentIntentId: 'paymentIntentId1', booked: false },
        { paymentIntentId: 'paymentIntentId2', booked: false },
        // Add more data as needed
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
