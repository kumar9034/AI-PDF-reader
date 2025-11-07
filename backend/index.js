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

const app = express()
const PORT = 5000

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // ✅ no trailing slash
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
 
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
const pathfile = "AI Question paper.pdf"  // Note the space before (1)
// TextLoader(pathfile)




