import { PDFParse } from "pdf-parse"; 
import fs from 'fs/promises';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";


const fileBuffer = await fs.readFile("./story.pdf")

const Uint8ArrayData = new Uint8Array(fileBuffer);

const parse = new PDFParse(Uint8ArrayData);

const data = await parse.getText()

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:200,     //means 300 character rahenge not a words
    chunkOverlap:80
})

const parts = await splitter.splitText(`${data.text}`)

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed"
});