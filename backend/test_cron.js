const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Visitor = require('./models/Visitor');
const Notification = require('./models/Notification');
dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const overstayedVisitors = await Visitor.find({
            timeOut: null,
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });

        console.log(`Found ${overstayedVisitors.length} overstayed visitors.`);

        if (overstayedVisitors.length > 0) {
            const names = overstayedVisitors.map(v => v.name).join(', ');
            
            const newNotification = new Notification({
                title: "🚨 TEST Overstay Alert",
                message: `${overstayedVisitors.length} visitor(s) have not checked out by closing time. Please locate: ${names}`,
                readBy: []
            });

            await newNotification.save();
            console.log('Test notification saved successfully!');
        }
        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
};

runTest();
