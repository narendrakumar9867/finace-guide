import express from "express";

const app = express();
const port = 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from backend");
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})

