import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app, server } from "./socket.js";

dotenv.config({
    path: "./.env"
});

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error : ", error);
        throw error;
    })
    server.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("MongoDB connection error : ", error);
})