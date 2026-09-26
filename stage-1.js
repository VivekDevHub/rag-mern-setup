import { PDFParse } from "pdf-parse"; 
import fs from 'fs/promises';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import {config } from "dotenv";
import { Pinecone } from '@pinecone-database/pinecone';

config();

const pc = new Pinecone({ apiKey:process.env.PINECONE_API_KEY });

const fileBuffer = await fs.readFile("./story.pdf")

const Uint8ArrayData = new Uint8Array(fileBuffer);

const parse = new PDFParse(Uint8ArrayData);

const data = await parse.getText()

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:200,     //means 300 character rahenge not a words
    chunkOverlap:80
})

const parts = await splitter.splitText(`${data.text}`)
console.log("Total chunks:", parts.length);


const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey:process.env.MISTRAL_API_KEY
});

const vectors = await embeddings.embedDocuments(parts);
console.log("Embedding dimension:", vectors[0].length);

const vectorsData = vectors.map((vector,index) => ({
  text:parts[index],
  vector:vector
}))

const indexes = pc.Index("new-rag")

const vectorsStored = await indexes.upsert({
  records:vectorsData.map((vec) => {
     return {
         id: `${Math.random()*100000000000}`,
         metadata:{
          text:vec.text
         },
         values:vec.vector
     }
  }),
})


console.log(vectorsStored);
