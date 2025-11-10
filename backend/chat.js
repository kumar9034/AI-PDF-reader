import OpenAI from "openai";
import readline from "readline/promises"
import "dotenv/config";
import { vectorStore } from "./perpare.js";


const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function chat(Question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })


        
        const relevent = await vectorStore.similaritySearch(Question, 3)
        const result = relevent.map((chunks) => chunks.pageContent).join("\n\n")

        const SYSTEM_PROMPT = "you are assistant for question-answering tasks. Use the following relevant pieces of retrived context to answer the question. and   "
        const userQuery = `Question : ${Question}
           Relevent context : ${result}
           Answer :`
           const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: userQuery
                }
            ]
        });
        return response.choices[0].message.content
}


