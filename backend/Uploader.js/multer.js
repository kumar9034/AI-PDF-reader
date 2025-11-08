import multer from "multer";
import dotenv from "dotenv"
import express from "express"



dotenv.config();
const app = express();
app.use(express.json());

// configure multer
const storage = multer.memoryStorage(); // store in memory buffer
export const upload = multer({ storage });
