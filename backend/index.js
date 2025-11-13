/*
stage 1: indexing
1 . loadthe document - pdf , text
2. chunk the document 
3. Generate vector embeddings 
4. store the vector embeddings - vector database

stage 2 using the chatbot
1. setup LLM
2. Add retrieval setup
3. pass input * relevant information to LLM
4. congratulations

*/
import { chat } from "./chat.js";
import { TextLoader } from "./perpare.js";
import express from "express";
import cors from "cors";
import { upload } from "./Uploader.js/multer.js";
import { put } from '@vercel/blob';
import fs from 'fs';
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));


app.post("/chat", async (req, res) => {
  const { Question } = req.body;
  if (!Question) {
    return res.status(400).json({ message: "Question not able" });
  }

  const Answer = await chat(Question);
  res.status(200).json({ data: Answer });
});

app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const filePath = req.file.path;
        // Read file data into memory (Multer already saved it to disk)
        const fileData = fs.readFileSync(filePath); 

        // 1. Upload the file data to Vercel Blob
        const token = process.env.BLOB_READ_WRITE_TOKEN
        // The file name will be used as the blob key
        const blob = await put(req.file.originalname, fileData, {
            access: 'public', // Makes the file URL publicly accessible
            contentType: req.file.mimetype,
            token,
            // The put function automatically uses the BLOB_READ_WRITE_TOKEN 
            // from the environment variables.
        });
        // 2. Delete the temp file
        fs.unlinkSync(filePath);
        
        // 3. The blob object contains the final URL
        const fileUrl = blob.url; 
        
        const message = TextLoader(fileUrl)
        // 4. Return success (and proceed to RAG indexing with fileUrl)
        res.json({ success: true, fileUrl, message : message });

    } catch (err) {
        console.error("Vercel Blob Upload Error:", err.message);
        res.status(500).json({ message: "Vercel Blob upload failed", error: err.message });
    }
});
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});




