import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import "dotenv/config";
import { CharacterTextSplitter } from "@langchain/textsplitters"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  apiKey: process.env.GOOGLE_API_KEY
});

const pinecone = new PineconeClient({apiKey:process.env.PINECONE_API_KEY});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME)

export const vectorStore = await PineconeStore.fromExistingIndex(
  embeddings,
  {
    pineconeIndex,
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 5,
    // You can pass a namespace here too
    // namespace: "foo",
  }
);

export async function TextLoader(pathfile) {
    const loader = new PDFLoader(pathfile, {splitPages: false})
    const doc = await loader.load()
    

    const textSplitter = new CharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100
    })
    const chunks = await textSplitter.splitText(doc[0].pageContent)
    // console.log("Document chunks:", chunks)

    const documents = chunks.map((chunk)=>{
        return {
            pageContent : chunk,
            metaDate : doc[0].metadata
        }
    })
    await vectorStore.addDocuments(documents);

    // console.log(documents)
}
