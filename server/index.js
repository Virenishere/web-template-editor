const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConnection = require("./configs/dbConnection");
const templateRoutes = require("./routes/templeRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS config

app.use(cors({
  origin: ["http://localhost:3000", "https://web-template-editor.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// DB Connection
dbConnection();

// Routes
app.use("/api/templates", templateRoutes);

app.get("/", (req, res) => {
  res.json({ message: "server is running..." });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
