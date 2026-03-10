const cron = require('node-cron');
const Visitor = require('../models/Visitor');
const Notification = require('../models/Notification');

const initCronJobs = () => {
  // Run every day at 17:00 (5:00 PM)
  cron.schedule('0 17 * * *', async () => {
    console.log('[CRON] Starting daily 5 PM overstay check...');
    try {
      // Find any active visitor who entered before 5:00 PM today (includes previous days)
      const now = new Date();
      const fivePMToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);

      const overstayedVisitors = await Visitor.find({
        timeOut: null,
        createdAt: { $lt: fivePMToday }
      });

      if (overstayedVisitors.length > 0) {
        console.log(`[CRON] Found ${overstayedVisitors.length} overstayed visitors. Dispatching alert...`);
        
        // Build an alert message
        const names = overstayedVisitors.map(v => v.name).join(', ');
        
        const newNotification = new Notification({
          title: "🚨 Overstay Alert (5:00 PM)",
          message: `${overstayedVisitors.length} visitor(s) have not checked out by closing time. Please locate: ${names}`,
          readBy: []
        });

        await newNotification.save();
      } else {
         console.log('[CRON] No overstayed visitors found today. Premises clear.');
      }
    } catch (error) {
      console.error('[CRON] Error executing overstay check:', error);
    }
  });

  console.log('[CRON] Background jobs initialized (5 PM Overstay Alert enabled).');
};

module.exports = initCronJobs;
