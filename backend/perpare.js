import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import "dotenv/config";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import path from "path";
import fs from "fs/promises";
import axios from "axios";
import { json } from "stream/consumers";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GOOGLE_API_KEY
});

const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export const vectorStore = await PineconeStore.fromExistingIndex(
  embeddings,
  { pineconeIndex, maxConcurrency: 5 }
);

export async function TextLoader(pdfUrl) {
  console.log(pdfUrl)
  try{
      const tempPath = path.join(process.cwd(), "temp.pdf");
    
      const response = await axios.get(pdfUrl, { responseType: "arraybuffer", headers: {
        "User-Agent": "RAG-Indexing-Agent/1.0" 
    }});
      await fs.writeFile(tempPath, response.data);
    
      const loader = new PDFLoader(tempPath, { splitPages: false });
      const doc = await loader.load();
    
      const textSplitter = new CharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100
      });
    
      const chunks = await textSplitter.splitText(doc[0].pageContent);
    
      const documents = chunks.map(chunk => ({
        pageContent: chunk,
        metadata: doc[0].metadata
      }));
    
      await vectorStore.addDocuments(documents);
      return {
        success : true,
        message : " PDF text embedded into Pinecone successfully"
      }

  }catch(error){
    console.error("❌ Error in TextLoader:", error.response);
    return {
      success : false,
        error : error.response
    }
  }

}
