const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
require("dotenv").config();
const connectdb = require("./config/db");
const AdminAuth = require("./routes/AdminAuth.js");
const Uploads = require("./routes/UploadRoute.js");
const mail = require("./routes/SendMail.js");
const emailRoutes = require("./routes/Email.js");
const sms = require("./routes/SmsRoute.js");
const visitor = require("./routes/VisitorRoutes.js");
const occurrence = require("./routes/OccurenceRoute.js");
const auth = require("./routes/LoginSignup.js");
const inquiryStaffRoutes = require("./routes/InquiryRoute.js");
const faqRoutes = require("./routes/FAQRoute.js");
const notificationRoutes = require("./routes/NotificationRoute.js");
const locationRoutes = require("./routes/LocationRoute.js");
const reportRoutes = require("./routes/ReportRoute.js");
const settingsRoutes = require("./routes/SettingsRoute.js");
const errorHandler = require("./middleware/Errorhandler.js");
const initCronJobs = require("./services/CronJobs.js");

dotenv.config();
connectdb();
initCronJobs();

const app = express();
app.set("trust proxy", 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Attach io to app so routes can access req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ WebSockets client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔌 WebSockets client disconnected:", socket.id);
  });
});

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://magnet-gatepass.onrender.com",
  "https://visitrack.magtrack.co.ke",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "*"],
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

// Rate Limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: "Too many requests from this IP, please try again later.",
  })
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ success: false, message: err.message });
});

// Routes
app.use("/api/sendmail", mail);
app.use("/api/email", emailRoutes);
app.use("/api/sms", sms);
app.use("/api/admin", AdminAuth);
app.use("/api/visitors", visitor);
app.use("/api/occurrences", occurrence);
app.use("/api/auth", auth);
app.use("/api/inquiry-staff", inquiryStaffRoutes);
app.use("/api/staff", require("./routes/StaffRoute"));
app.use("/api/upload", Uploads);
app.use("/api/faq", faqRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);

// Graceful Shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Terminating server...");
  process.exit(0);
});

// Listen on HTTP Server with Socket.io attached
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server & WebSockets running on port ${PORT}`);
});
