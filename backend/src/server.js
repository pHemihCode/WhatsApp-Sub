const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const whatsappRoutes = require("./routes/whatsapp");
const sheetsRoutes = require("./routes/sheets");
const subscriptionRoutes = require("./routes/subscription");
const userRequestsRoutes = require("./routes/userRequests");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const webhookRoutes = require("./routes/webhooks");
// const whatsappService = require('./services/whatsappService');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/sheets", sheetsRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/requests", userRequestsRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webhooks", webhookRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// await whatsappService.sendTemplate(
//   user.phoneNumber,
//   "trial_instructions",
//   "en_US",
//   [{ type: "body", parameters: [{ type: "text", text: user.name }] }]
// );

// Routes (to be implemented)
app.get("/", (req, res) => {
  res.json({ message: "Welcome to WhatsApp Subscription System API" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
