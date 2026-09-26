sabse pehle pdf data ko text me convert krenge pdf parse library se

const data = await fs.readFile("./file.pdf");
console.log(data);
Node.js PDF ko text/string ki tarah nahi, balki binary data ki tarah read karta hai.
Isliye output: <Buffer 25 50 44 46 2d 31 2e 35 ...>


1. pdf parse PDF binary data → readable text
PDFParse us binary PDF ko understand karke text nikalta hai.


2. Node.js ka file system import
import fs from 'fs/promises';

fs = File System

Node.js ka built-in module hai jisse hum files ke saath kaam kar sakte hain.

fs/promises use karne se hum: await fs.readFile(...) jaisi async operations kar sakte hain.



3. PDF file read karna const fileBuffer = await fs.readFile("./story.pdf")
Result: fileBuffer mein PDF ka binary data store hoga

console.log(fileBuffer); karoge, tumhe kuch aisa dikhega:
<Buffer 25 50 44 46 2d 31 2e 35 ...>


4. Buffer ko Uint8Array mein convert karna
const Uint8ArrayData = new Uint8Array(fileBuffer);
fs.readFile() tumhe Node.js ka buffer deta hai Lekin PDFParse ko PDF data ke liye Uint8Array format chahiye. 
Uint8Array basically 8-bit unsigned numbers ki array hoti hai. example - 25 50 44 46 2d 31 2e 35 ye bytes hain.


5. PDF parser ka object banana
const parse = new PDFParse(Uint8ArrayData);
Ab hum PDF parser ko PDF ka actual binary data de rahe hain.

6. PDF se text extract karna console.log(await parse.getText())


import { PDFParse } from "pdf-parse";  
import fs from 'fs/promises';

const fileBuffer = await fs.readFile("./story.pdf")

const Uint8ArrayData = new Uint8Array(fileBuffer);

const parse = new PDFParse(Uint8ArrayData);

console.log(await parse.getText())

             PDF
              │
              ▼
       fs.readFile()
              │
              ▼
           Buffer
              │
              ▼
         Uint8Array
              │
              ▼
         PDFParse
              │
              ▼
         getText()
              │
              ▼
        Extracted Text
              │
              ▼
           Chunks
              │
              ▼
         Embeddings
              │
              ▼
        Vector Database
              │
              ▼
       RAG Retrieval

====================================================================
TEXT BREAK KARENGE 
ab text data ko nearly 300 characters par break krunga 

langchain text splitters we use (RecursiveCharacterTextSplitter)
 https://docs.langchain.com/oss/python/integrations/splitters

install packages : npm install langchain @langchain/textsplitters  @langchain/core


const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:300,     //means 300 character rahenge not a words
    chunkOverlap:0
})

const parts = await splitter.splitText(`${data.text}`)

problem yeh aari hai ki ek array me pura data aa rhahai comma comma se split ho rha hai number of character par example se samjho mene chunks:20 diya toh har 20 character me split hoga including space also. words nahi character

chunksize means ek particular part me kitne character aane wale hai 

Overlap : part1 ki embedding alag part2 ki embedding ki alag hai par jab dono chunks me kuch kuch data same hai  part hai toh overlap kardenge embeddings jo banegi same banegiii

=================================================================================
embedding models me pass karke convert karna hai

npm i @langchain/mistralai
https://docs.langchain.com/oss/javascript/deepagents/rag#mistralai


const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey:process.env.MISTRAL_API_KEY
});

const vectors = await embeddings.embedDocuments(parts);


const vectorsData = vectors.map((vector,index) => ({
  text:parts[index],
  vector:vector
}))

console.log(vectorsData);
yeh apne array form me vectors dikhenge embedding dikhenge or isko store karenge database me or inki range rehti hai 0 se -1 ke beech me

isme text or embeddings dono dikh jayenge console me

=============================================================

VECTOR DATABSE
embeddings vectors ko database me store karna hai
yaha par hum pinecone database use karenge

pinecone ek database hoga isme honge indexes or in indexes ko collection ki tarah rakh sakte ho  create new index kroge toh dimension me aapko btana padhega mere ek array me 1024 embeddings hai toh dimension me likhna 1024

1. pinecone database signin kro
2. create index par click kro then custom setting me jao
3. dimension me likho ek array me kitni digits ex=1024
4. create index pr click karo last me toh index create ho jayegaa
5. manage key me jake new api key create karke dotnev me paste kardo

Install - npm install @pinecone-database/pinecone
const pc = new Pinecone({ apiKey:process.env.PINECONE_API_KEY });

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

====================================STAGE-2=============================================




