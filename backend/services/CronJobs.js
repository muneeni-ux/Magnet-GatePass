const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Visitor = require('../models/Visitor');
const Notification = require('../models/Notification');
const User = require('../models/User');

const initCronJobs = () => {
  // Run every day at 17:00 (5:00 PM)
  cron.schedule('0 15 * * *', async () => {
    console.log('[CRON] Starting daily 5 PM overstay check...');
    try {
      // Find any active visitor who entered before 5:00 PM today (includes previous days)
      const now = new Date();
      const fivePMToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0);

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

  // Daily DB Backup directly to Admin logic (Disaster Recovery at 3:00 AM)
  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] Starting Disaster Recovery Database Backup (3:00 AM)...');
    try {
      const allVisitors = await Visitor.find({}).lean();
      
      const backupData = JSON.stringify(allVisitors, null, 2);
      const backupBuffer = Buffer.from(backupData, "utf-8");
      
      const admins = await User.find({ isAdmin: true });
      const adminEmails = admins.map(a => a.email).filter(e => e).join(',');

      if (!adminEmails) {
        console.log('[CRON] No valid admin emails found. Skipping DR backup dispatch.');
        return;
      }

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      const dateStr = new Date().toISOString().split('T')[0];

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: adminEmails,
        subject: `🚨 VisiTrack DR Backup - ${dateStr}`,
        text: `Attached is the daily automated MongoDB dump for disaster recovery. Total Records: ${allVisitors.length}\r\nThis ensures redundancy even if the primary database partition fails.`,
        attachments: [
          {
            filename: `visitrack_db_dump_${dateStr}.json`,
            content: backupBuffer,
          }
        ]
      });

      console.log(`[CRON] Disaster Recovery Backup dispatched successfully to: ${adminEmails}`);
    } catch (error) {
      console.error('[CRON] Error executing Disaster Recovery Backup:', error);
    }
  });

  console.log('[CRON] Disaster Recovery Auto-Backup enabled (Scheduled: 03:00 AM).');
};

module.exports = initCronJobs;
