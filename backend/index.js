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

 
const pathfile = "AI Question paper.pdf"  // Note the space before (1)
// TextLoader(pathfile)
chat()




