const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const dbConnection = require("./configs/dbConnection");
const templateRoutes = require("./routes/templeRoutes");
const PORT = process.env.PORT || 8000;

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
dbConnection();

// Routes
app.use("/api/templates", templateRoutes);

app.get("/",(req,res)=>{
    res.json({
        message: "server is running..."
    })
})

app.listen(PORT , ()=>{
    console.log(`server is running at http://localhost:${PORT}`);
})