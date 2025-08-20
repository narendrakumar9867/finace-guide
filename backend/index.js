import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/database.js";

import userRoute from "./src/routes/users.route.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use( "/api", userRoute);

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    connectDB();
})

