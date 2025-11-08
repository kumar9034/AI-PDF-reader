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
import { chat } from "./chat.js"
import { TextLoader } from "./perpare.js"
import express, { json } from "express"
import cors from "cors"
import { upload } from "./Uploader.js/multer.js"
import cloudinary from "./Uploader.js/cloudinary.js"

const app = express()
const PORT = process.env.PORT

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL ,  // ✅ no trailing slash
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.post("/chat",async (req, res)=>{
    const { Question } =req.body
    if(!Question){
        return res.status(400).json({message : "Question not able"})
    }

   const Answer = await chat(Question)
    res.status(200).json({data: Answer })
})
 
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "chat_uploads",
        resource_type: "raw", // ✅ for PDFs and non-image files
        access_mode: "public",
      },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          return res.status(500).json({ error: "Upload failed" });
        }

        // 🟩 FIX: Rename variable to avoid shadowing Express res
        const loaderResponse = await TextLoader(result.secure_url);

        return res.json({
          success: true,
          message: loaderResponse.message,
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    // ✅ Important: send the file buffer to Cloudinary
    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});





