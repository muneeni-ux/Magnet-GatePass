// backend/routes/sendEmail.js
const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

const departmentEmails = {
  "Logistics": "joenjaga50@gmail.com",
  "Human Resource": "hr@yourdomain.com",
  "Production": "production@yourdomain.com",
  "Finance": "mainafrank400@gmail.com",
  "Sales and Marketing": "sales@yourdomain.com",
  "BDS": "bds@yourdomain.com",
  "Directors Office": "director@yourdomain.com",
};

router.post("/send-email", async (req, res) => {
  const { name, address, idNumber, vehicleReg, company, visitorType, phone, officer, department, purpose } = req.body;

  const toEmail = departmentEmails[department];

  if (!toEmail) return res.status(400).json({ error: "Invalid department" });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `New Visitor: ${name}`,
    html: `
      <h3>New Visitor Alert</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>ID Number:</strong> ${idNumber}</p>
      <p><strong>Vehicle Reg:</strong> ${vehicleReg}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Visitor Type:</strong> ${visitorType}</p>
      <p><strong>Officer to Visit:</strong> ${officer}</p>
      <p><strong>Department:</strong> ${department}</p>
      <p><strong>Purpose:</strong> ${purpose}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("Error sending mail:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
